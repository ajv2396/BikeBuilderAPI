
//-------------------------------------STEPS MANAGEMENT-------------------------------------
const panels = document.querySelectorAll('.step-panel');
const NextBtn = document.querySelector(".next-btn");
let currentStep = 0;

document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {

        CollectFormData();


        //Stop user from progressing if the inputs arent all entered (apart from address2) + regex for valid postcode check
        if (currentStep === 0) {
            //highlight empty fields
            ['firstname', 'lastname', 'address1', 'city', 'postcode'].forEach(HighlightEmptyField);

            if (!formData.firstname || !formData.lastname || !formData.address1 || !formData.city || !formData.postcode) {
                return;
            }

            //--------------------------------------------------------------------
            //regex for checking if postcode is valid
            const Postcode = formData.postcode.trim().toUpperCase().replace(/\s+/, ' ');
            const regex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][ABD-HJLNP-UW-Z]{2}$/i;

            const IsValidPostcode = regex.test(Postcode);

            if (!IsValidPostcode) {
                // Highlight postcode field as invalid
                HighlightPostcodeBox();
                return;
            }
            //--------------------------------------------------------------------

        }

        if (currentStep === 1) {
            //highlight empty fields
            ['cardholder', 'cardnumber', 'date', 'verification'].forEach(HighlightEmptyField);

            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                alert('Please select a payment method.');
                return;
            }

            if (!formData.cardholder || !formData.cardnumber || !formData.date || !formData.cvv) {
                return;
            }
        }

        if (currentStep === panels.length - 1 && NextBtn.textContent === "Finish") {
            localStorage.removeItem("checkoutSummary");
            window.location.href = "index.html";
            return;
        }

        if (NextBtn.textContent === "Place Order") {
            ProcessPayment(); // Now ready to process the order
            return;
        }

        if (currentStep < panels.length - 1) {
            panels[currentStep].style.display = 'none';
            currentStep++;
            panels[currentStep].style.display = 'block';
        }


        if (currentStep === 2) {
            FillConfirmation();
            return;
        } else if (currentStep === 3) {

            //make the 'next' button 'finish', then hide back button and put the Finish button at end of container
            document.querySelector(".next-btn").textContent = "Finish";
            document.querySelector(".back-btn").style.display = "none";
            const footer = document.querySelector(".panel-footer");
            footer.style.justifyContent = "flex-end";
        }
    });
});

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentStep > 0) {
            if (currentStep === 3) {
                document.querySelector(".next-btn").textContent = "Next Step";
            }
            if (currentStep === 2) {
                document.querySelector(".next-btn").textContent = "Next Step";
            }


            panels[currentStep].style.display = 'none';
            currentStep--;
            panels[currentStep].style.display = 'block';
        }
    });
});

//----------------------------------SAVING DATA ENTERED----------------------------------
const checkoutSummary = JSON.parse(localStorage.getItem("checkoutSummary") || "{}");

const formData = {};

formData.totalprice = checkoutSummary.totalPrice || 0;
formData.itemsnumber = checkoutSummary.itemsCount || 0;

function CollectFormData() {
    formData.firstname = document.getElementById('firstname').value;
    formData.lastname = document.getElementById('lastname').value;
    formData.address1 = document.getElementById('address1').value;
    formData.address2 = document.getElementById('address2').value;
    formData.city = document.getElementById('city').value;
    formData.postcode = document.getElementById('postcode').value;
    formData.paymentMethod = document.querySelector('input[name="payment"]:checked')?.id || '';
    formData.cardholder = document.getElementById('cardholder').value;
    formData.cardnumber = document.getElementById('cardnumber').value;
    formData.date = document.getElementById('date').value;
    formData.cvv = document.getElementById('verification').value;
}
//--------------------------FILL CONFIRMAITON PAGE WITH GATHERED DATA--------------------------

function FillConfirmation() {

    document.querySelector(".next-btn").textContent = "Place Order";

    let ShortCardNumber = formData.cardnumber.substring(0, 5);
    ShortCardNumber = ShortCardNumber + "**** **** ****";

    const step3 = document.getElementById('step-3');

    step3.innerHTML = `
                <h2 class="title">Checkout</h2>

                <div class="progress-bar">
                    <div class="step active"></div>
                    <div class="step active"></div>
                    <div class="step"></div>
                    <div class="step"></div>
                </div>
            <div class="confirmation">
                <h3>Delivery Info</h3>
                <p><strong>Name:</strong> ${formData.firstname} ${formData.lastname}</p>
                <p><strong>Address:</strong> ${formData.address1}, ${formData.address2 ? formData.address2 + ',' : ''} ${formData.city}, ${formData.postcode}</p>
                <br/>
                <h3>Payment Info</h3>
                <p><strong>Method:</strong> ${formData.paymentMethod}</p>
                <p><strong>Cardholder:</strong> ${formData.cardholder}</p>
                <p><strong>Card Number:</strong> ${ShortCardNumber}</p>
                <br/>
                <h3>Delivery</h3>
                <p><strong>Delivery Method</strong> Express Delivery: Free</p>
                <br/>
                <h3>Total Price</h3>
                <p><strong>Total Price of ${formData.itemsnumber} item(s): </strong> £${formData.totalprice}.00 </p>
            </div>
        `;
}

//--------------------------PROCESS PAYMENT--------------------------
function ProcessPayment() {
    const step3 = document.getElementById('step-3');

    // Show processing UI
    step3.innerHTML = `
        <h2 class="title">Checkout</h2>
        <div class="progress-bar">
            <div class="step active"></div>
            <div class="step active"></div>
            <div class="step"></div>
            <div class="step"></div>
        </div>
        <div class="confirmation">
            <p><strong>Processing payment...</strong></p>
        </div>
        <div class="loader" style="
            margin: 20px auto;
            width: 50px;
            height: 50px;
            border: 5px solid #ccc;
            border-top: 5px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;">
        </div>
    `;

    // Build order payload
    const orderData = {
        accountID: LoggedInAccountID,   // from session
        totalPrice: formData.totalprice
    };

    fetch("https://localhost:7165/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    })
        .then(res => {
            if (!res.ok) throw new Error("Order creation failed");
            return res.json();
        })
        .then(data => {
            console.log("Order created:", data);

            // Clear basket + checkout cache
            localStorage.removeItem("checkoutSummary");

            // Move to Order Complete step
            panels[currentStep].style.display = 'none';
            currentStep++;
            panels[currentStep].style.display = 'block';

            document.querySelector(".next-btn").textContent = "Finish";
            document.querySelector(".back-btn").style.display = "none";
            document.querySelector(".panel-footer").style.justifyContent = "flex-end";
        })
        .catch(err => {
            console.error(err);
            alert("Payment failed. Please try again.");
        });
}




//--------------------------HIGHLIGHT EMPTY BOXES--------------------------
function HighlightEmptyField(id) {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
        el.style.border = '1px solid red';
    } else {
        el.style.border = '';
    }
}

//--------------------------HIGHLIGHT POSTCODE BOX--------------------------
function HighlightPostcodeBox() {
    const el = document.getElementById('postcode'); // 'postcode' must be a string
    const label = document.getElementById('invalid-postcode'); // Use correct ID

    if (label) {
        label.textContent = "Use a Valid Postcode - E.g. WA7 5WN";
        label.style.color = 'red';
    }

    if (el) {
        el.style.border = '1px solid red';
    }
}

