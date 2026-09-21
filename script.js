/* =====================================================
   MANAVTACLASS LANDING PAGE
   JAVASCRIPT
===================================================== */


/* =====================================================
   1. CLASS-SPECIFIC PAYMENT LINKS
===================================================== */

// async function enrollNow() {
//   if (!selectedClass) {
//     showToast("Please select your class first.");
//     return;
//   }

//   try {
//     const response = await fetch("/api/create-order", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         className: selectedClass
//       })
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || "Payment failed");
//     }

//     const options = {
//       key: data.keyId,
//       amount: data.amount,
//       currency: "INR",
//       name: "ManavtaClass",
//       description: `Class ${selectedClass} - 2026-27`,
//       order_id: data.orderId,

//       prefill: {
//         name: "",
//         contact: ""
//       },

//       hidden: {
//         email: true
//       },

//       notes: {
//         class: `Class ${selectedClass}`
//       },

//       // handler: function (response) {
//       //   showToast("Payment successful! ✓");
//       //   console.log("Payment ID:", response.razorpay_payment_id);
//       // },
//       handler: async function (response) {

//         try {

//           const verifyResponse = await fetch(
//             "/api/verify-payment",
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json"
//               },

//               body: JSON.stringify({
//                 razorpay_order_id:
//                   response.razorpay_order_id,

//                 razorpay_payment_id:
//                   response.razorpay_payment_id,

//                 razorpay_signature:
//                   response.razorpay_signature
//               })
//             }
//           );

//           const result = await verifyResponse.json();

//           if (result.success) {

//             showToast(
//               "Payment successful! ✓"
//             );

//             console.log(
//               "Payment ID:",
//               response.razorpay_payment_id
//             );

//             console.log(
//               "Class:",
//               selectedClass
//             );

//           } else {

//             showToast(
//               "Payment verification failed."
//             );

//           }

//         } catch (error) {

//           console.error(error);

//           showToast(
//             "Could not verify payment."
//           );
//         }
//       },

//       theme: {
//         color: "#2563eb"
//       }
//     };

//     const rzp = new Razorpay(options);
//     rzp.open();

//   } catch (error) {
//     console.error(error);
//     showToast("Unable to start payment. Please try again.");
//   }
// }


/* =====================================================
   2. VARIABLES
===================================================== */

const classButtons =
  document.querySelectorAll(".class-button");


const selectedClassText =
  document.getElementById("selectedClass");


const desktopEnroll =
  document.getElementById("desktopEnroll");


const mobileEnroll =
  document.getElementById("mobileEnroll");


let selectedClass = null;


/* =====================================================
   3. CLASS SELECTION
===================================================== */
function getCookie(name) {

  const match =
    document.cookie.match(
      new RegExp(
        "(^|;\\s*)" +
        name.replace(
          /[-[\]{}()*+?.,\\^$|#\s]/g,
          "\\$&"
        ) +
        "=([^;]*)"
      )
    );

  return match
    ? decodeURIComponent(match[2])
    : "";
}


function getFbc() {

  /*
   * Use Meta's existing _fbc cookie
   */

  const existingFbc =
    getCookie("_fbc");

  if (existingFbc) {
    return existingFbc;
  }

  /*
   * If _fbc doesn't exist,
   * check for fbclid in URL.
   */

  const params =
    new URLSearchParams(
      window.location.search
    );

  const fbclid =
    params.get("fbclid");

  if (!fbclid) {
    return "";
  }

  /*
   * Construct fbc value
   */

  return `fb.1.${Date.now()}.${fbclid}`;
}

classButtons.forEach(button => {
  button.addEventListener("click", function () {

    /* Remove previous selection */
    classButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    /* Activate selected class */
    this.classList.add("active");

    /* Get selected class */
    selectedClass = this.dataset.class;

    /* Update selected message */
    selectedClassText.innerHTML =
      "Class " + selectedClass + " selected ✓";

    /* Enable enrollment buttons */
    desktopEnroll.disabled = false;
    mobileEnroll.disabled = false;

    /* Change button text */
    desktopEnroll.innerText = "ENROLL FOR ₹29";
    mobileEnroll.innerText = "ENROLL FOR ₹29";

    /* Open Razorpay immediately */
    enrollNow();
  });
});


/* =====================================================
   4. ENROLL FUNCTION
===================================================== */

// function enrollNow() {

//   /* Safety check */

//   if (!selectedClass) {

//     showToast(
//       "Please select your class first."
//     );

//     return;
//   }


//   /* Get payment URL */

//   const paymentURL =
//     paymentLinks[selectedClass];


//   /* Check payment URL */

//   if (
//     !paymentURL ||
//     paymentURL.includes("YOUR_CLASS")
//   ) {

//     showToast(
//       "Payment link for Class " +
//       selectedClass +
//       " is not configured yet."
//     );

//     return;
//   }


//   /* Redirect to payment */

//   window.location.href =
//     paymentURL;

// }

async function enrollNow() {
  // const response = await fetch(
  //   "/api/create-order",
  //   {
  //     method: "POST",

  //     headers: {
  //       "Content-Type": "application/json"
  //     },

  //     body: JSON.stringify({

  //       className: selectedClass,

  //       fbp: getCookie("_fbp"),

  //       fbc: getFbc()

  //     })
  //   }
  // );

  if (!selectedClass) {
    showToast("Please select your class first.");
    return;
  }

  try {
    const response = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        className: selectedClass,
        fbp: getCookie("_fbp"),
        fbc: getFbc()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Payment failed");
    }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: "INR",
      name: "ManavtaClass",
      description: `Class ${selectedClass} - 2026-27`,
      order_id: data.orderId,

      prefill: {
        name: "",
        contact: ""
      },

      hidden: {
        email: true
      },

      notes: {
        class: `Class ${selectedClass}`
      },

      handler: async function (response) {
        try {
          const verifyResponse = await fetch(
            "/api/verify-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            }
          );

          const result = await verifyResponse.json();

          if (result.success) {
            showToast("Payment successful! ✓");
            console.log("Payment ID:", response.razorpay_payment_id);
            console.log("Class:", selectedClass);
          } else {
            showToast("Payment verification failed.");
          }

        } catch (error) {
          console.error(error);
          showToast("Could not verify payment.");
        }
      },

      theme: {
        color: "#2563eb"
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error(error);
    showToast("Unable to start payment. Please try again.");
  }
}
/* =====================================================
   5. DESKTOP ENROLL BUTTON
===================================================== */

desktopEnroll.addEventListener(
  "click",
  enrollNow
);


/* =====================================================
   6. MOBILE ENROLL BUTTON
===================================================== */

mobileEnroll.addEventListener(
  "click",
  enrollNow
);


/* =====================================================
   7. COUNTDOWN TIMER
===================================================== */

let timeLeft =
  2 * 60 * 1000;


const minutesElement =
  document.getElementById("minutes");


const secondsElement =
  document.getElementById("seconds");


const millisecondsElement =
  document.getElementById("milliseconds");


function updateCountdown() {

  const minutes =
    Math.floor(
      timeLeft / 60000
    );


  const seconds =
    Math.floor(
      (timeLeft % 60000) / 1000
    );


  const milliseconds =
    Math.floor(
      (timeLeft % 1000) / 10
    );


  minutesElement.innerText =
    String(minutes).padStart(2, "0");


  secondsElement.innerText =
    String(seconds).padStart(2, "0");


  millisecondsElement.innerText =
    String(milliseconds).padStart(2, "0");


  if (timeLeft <= 0) {

    clearInterval(countdownTimer);

    minutesElement.innerText = "00";

    secondsElement.innerText = "00";

    millisecondsElement.innerText = "00";

    return;
  }


  timeLeft -= 10;

}


/* Start timer */

updateCountdown();


/* Update every 10 milliseconds */

const countdownTimer =
  setInterval(
    updateCountdown,
    10
  );


/* =====================================================
   8. TOAST
===================================================== */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById("toast");


  toast.innerText =
    message;


  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}