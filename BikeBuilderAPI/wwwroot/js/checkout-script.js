
//-------------------------------------STEPS MANAGEMENT-------------------------------------
const panels = document.querySelectorAll('.step-panel');
const NextBtn = document.querySelector(".next-btn");
let currentStep = 0;

document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {

        CollectFormData();


        //Stop user from progressing if the inputs arent all entered (apart from address2)
        if (currentStep === 0) {
            //highlight empty fields
            ['firstname', 'lastname', 'address1', 'city', 'postcode'].forEach(highlightEmptyField);

            if (!formData.firstname || !formData.lastname || !formData.address1 || !formData.city || !formData.postcode) {
                return;
            }
        }

        if (currentStep === 1) {
            //highlight empty fields
            ['cardholder', 'cardnumber', 'date', 'verification'].forEach(highlightEmptyField);

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
            panels[currentStep].style.display = 'none';
            currentStep--;
            panels[currentStep].style.display = 'block';
        }
    });
});

//----------------------------------SAVING DATA ENTERED----------------------------------
const formData = {};
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
            </div>
        `;
}

//--------------------------FILL CONFIRMAITON PAGE WITH GATHERED DATA--------------------------
function ProcessPayment() {
    const step3 = document.getElementById('step-3');

    step3.innerHTML = `
        <h2 class="title">Checkout</h2>
        <div class="progress-bar">
            <div class="step active"></div>
            <div class="step active"></div>
            <div class="step "></div>
            <div class="step"></div>
        </div>
        <div class="confirmation">
            <p><strong>Processing Payment...</strong></p>
        </div>
        <div class="loader" style="margin: 20px auto; width: 50px; height: 50px; border: 5px solid #ccc; border-top: 5px solid #333; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    `;

    // Delay for 2 seconds
    setTimeout(() => {
        panels[currentStep].style.display = 'none';
        currentStep++;
        panels[currentStep].style.display = 'block';

        document.querySelector(".next-btn").textContent = "Finish";
        document.querySelector(".back-btn").style.display = "none";
        document.querySelector(".panel-footer").style.justifyContent = "flex-end";
    }, 2000);
}




//--------------------------HIGHLIGHT EMPTY BOXES--------------------------
function highlightEmptyField(id) {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
        el.style.border = '1px solid red';
    } else {
        el.style.border = '';
    }
}

