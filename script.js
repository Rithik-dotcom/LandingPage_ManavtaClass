/* =====================================================
   MANAVTACLASS LANDING PAGE
   JAVASCRIPT
===================================================== */



/* =====================================================
   1. CLASS-SPECIFIC PAYMENT LINKS

   Replace these with your actual Razorpay/payment
   links for each class.
===================================================== */

const paymentLinks = {

  "6":
    "YOUR_CLASS_6_PAYMENT_URL",

  "7":
    "YOUR_CLASS_7_PAYMENT_URL",

  "8":
    "YOUR_CLASS_8_PAYMENT_URL",

  "9":
    "YOUR_CLASS_9_PAYMENT_URL",

  "10":
    "YOUR_CLASS_10_PAYMENT_URL"

};



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

classButtons.forEach(button => {

  button.addEventListener("click", function () {


    /* Remove previous selection */

    classButtons.forEach(btn => {

      btn.classList.remove("active");

    });



    /* Activate selected class */

    this.classList.add("active");



    /* Get selected class */

    selectedClass =
      this.dataset.class;



    /* Update selected message */

    selectedClassText.innerHTML =
      "Class " +
      selectedClass +
      " selected ✓";



    /* Enable enrollment buttons */

    desktopEnroll.disabled = false;

    mobileEnroll.disabled = false;



    /* Change button text */

    desktopEnroll.innerText =
      "ENROLL FOR ₹29";


    mobileEnroll.innerText =
      "ENROLL FOR ₹29";

  });

});



/* =====================================================
   4. ENROLL FUNCTION
===================================================== */

function enrollNow() {


  /* Safety check */

  if (!selectedClass) {

    showToast(
      "Please select your class first."
    );

    return;

  }



  /* Get payment URL */

  const paymentURL =
    paymentLinks[selectedClass];



  /* Check payment URL */

  if (
    !paymentURL ||
    paymentURL.includes("YOUR_CLASS")
  ) {

    showToast(
      "Payment link for Class " +
      selectedClass +
      " is not configured yet."
    );

    return;

  }



  /* Redirect to payment */

  window.location.href =
    paymentURL;

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

   Starts at 2 minutes.

   Display:
   MM : SS : MS

   MS = hundredths of a second
   00–99
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


    minutesElement.innerText =
      "00";


    secondsElement.innerText =
      "00";


    millisecondsElement.innerText =
      "00";


    return;

  }


  timeLeft -= 10;

}



/* Start timer immediately */

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