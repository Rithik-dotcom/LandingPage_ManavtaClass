const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports.config = {
  api: {
    bodyParser: false
  }
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

function verifyWebhookSignature(rawBody, signature) {
  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_WEBHOOK_SECRET
    )
    .update(rawBody)
    .digest("hex");

  const actual = Buffer.from(signature || "", "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

async function redisCommand(command) {
  const response = await fetch(
    process.env.KV_REST_API_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(command)
    }
  );

  if (!response.ok) {
    throw new Error(`Redis error: ${response.status}`);
  }

  return response.json();
}

async function sendPurchaseToMeta(payment, orderNotes) {
  const datasetId = process.env.META_DATASET_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!datasetId || !accessToken) {
    throw new Error("Meta environment variables are missing");
  }

  const eventId = payment.id;

  const eventTime =
    payment.created_at ||
    Math.floor(Date.now() / 1000);

  const userData = {};

  // Email
  if (payment.email) {
    userData.em = crypto
      .createHash("sha256")
      .update(
        payment.email
          .trim()
          .toLowerCase()
      )
      .digest("hex");
  }

  // Phone
  if (payment.contact) {
    const phone = payment.contact.replace(/\D/g, "");

    if (phone) {
      userData.ph = crypto
        .createHash("sha256")
        .update(phone)
        .digest("hex");
    }
  }

  // Facebook browser identifiers from Razorpay Order notes
  if (orderNotes.fbp) {
    userData.fbp = orderNotes.fbp;
  }

  if (orderNotes.fbc) {
    userData.fbc = orderNotes.fbc;
  }

  // Purchase event
  const event = {
    event_name: "Purchase",
    event_time: eventTime,
    event_id: eventId,
    action_source: "website",

    user_data: userData,

    custom_data: {
      value: payment.amount / 100,
      currency: payment.currency || "INR"
    }
  };

  const url =
    `https://graph.facebook.com/v24.0/${datasetId}/events` +
    `?access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      data: [event]
    })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("META CAPI ERROR:", result);

    throw new Error("Meta CAPI request failed");
  }

  return result;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    // Get raw Razorpay webhook body
    const rawBody = await getRawBody(req);

    const signature =
      req.headers["x-razorpay-signature"];

    // Verify Razorpay webhook signature
    if (
      !signature ||
      !verifyWebhookSignature(
        rawBody,
        signature
      )
    ) {
      console.error(
        "Invalid Razorpay webhook signature"
      );

      return res.status(400).json({
        error: "Invalid webhook signature"
      });
    }

    // Parse webhook
    const payload = JSON.parse(
      rawBody.toString("utf8")
    );

    // Only process payment.captured
    if (
      payload.event !== "payment.captured"
    ) {
      return res.status(200).json({
        received: true,
        ignored: true
      });
    }

    // Get payment entity
    const payment =
      payload.payload &&
      payload.payload.payment &&
      payload.payload.payment.entity;

    if (!payment) {
      console.error(
        "Payment entity missing"
      );

      return res.status(400).json({
        error: "Payment data missing"
      });
    }

    // Extra payment safety check
    if (
      payment.status !== "captured" &&
      payment.captured !== true
    ) {
      return res.status(200).json({
        received: true,
        ignored: true,
        reason: "Payment not captured"
      });
    }

    // Razorpay Payment ID
    const paymentId = payment.id;

    if (!paymentId) {
      return res.status(400).json({
        error: "Payment ID missing"
      });
    }

    // Fetch the original Razorpay Order
    const order = await razorpay.orders.fetch(
      payment.order_id
    );

    // Get notes from the Razorpay Order
    const orderNotes = order.notes || {};

    console.log("ORDER DATA:", {
      orderId: payment.order_id,
      className: orderNotes.class || "",
      fbp: orderNotes.fbp || "",
      fbc: orderNotes.fbc || ""
    });

    // Redis duplicate protection
    const redisKey =
      `razorpay:purchase:${paymentId}`;

    const lockResult = await redisCommand([
      "SET",
      redisKey,
      "processing",
      "NX",
      "EX",
      "300"
    ]);

    // Already processed or processing
    if (
      lockResult &&
      lockResult.result !== "OK"
    ) {
      console.log(
        "Duplicate webhook:",
        paymentId
      );

      return res.status(200).json({
        received: true,
        duplicate: true
      });
    }

    try {
      // Send Purchase to Meta
      const metaResult =
        await sendPurchaseToMeta(
          payment,
          orderNotes
        );

      // Mark permanently processed
      await redisCommand([
        "SET",
        redisKey,
        "processed"
      ]);

      console.log(
        "META PURCHASE SENT:",
        paymentId,
        metaResult
      );

      return res.status(200).json({
        success: true,
        paymentId: paymentId,
        event: "Purchase",
        value: payment.amount / 100,
        currency:
          payment.currency || "INR"
      });

    } catch (metaError) {

      // Delete lock so Razorpay can retry
      await redisCommand([
        "DEL",
        redisKey
      ]);

      throw metaError;
    }

  } catch (error) {

    console.error(
      "WEBHOOK ERROR:",
      error
    );

    return res.status(500).json({
      error: "Webhook processing failed"
    });
  }
};