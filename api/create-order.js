const Razorpay = require("razorpay");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { className } = req.body;

    const validClasses = ["6", "7", "8", "9", "10"];

    if (!validClasses.includes(String(className))) {
      return res.status(400).json({ error: "Invalid class" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: 2900,
      currency: "INR",
      receipt: `class_${className}_${Date.now()}`,
      notes: {
        class: `Class ${className}`
      }
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Unable to create payment order"
    });
  }
};