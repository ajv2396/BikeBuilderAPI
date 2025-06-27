
//-------------------------------------STEPS MANAGEMENT-------------------------------------
const panels = document.querySelectorAll('.step-panel');
const NextBtn = document.querySelector(".next-btn");
let currentStep = 0;

document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentStep === panels.length - 1 && NextBtn.textContent === "Finish") {
            window.location.href = "index.html";
            return;
        }

        if (currentStep < panels.length - 1) {
            panels[currentStep].style.display = 'none';
            currentStep++;
            panels[currentStep].style.display = 'block';
        }

        if (currentStep === 2) {
            CollectFormData();
            FillConfirmation();
        }

        if (currentStep === 3) {
            //make the 'next' button 'finish', then hide back button and put the Finish button at end of container
            document.querySelector(".next-btn").textContent = "Finish";
            document.querySelector(".back-btn").style.display = "none";
            const footer = document.querySelector(".panel-footer");
            footer.style.justifyContent = "flex-end";
        }

        if (currentStep === 0 || currentStep === 1) {
            collectFormData();
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
}
//--------------------------FILL CONFIRMAITON PAGE WITH GATHERED DATA--------------------------

function FillConfirmation() {

    document.querySelector(".next-btn").textContent = "Place Order";

    let ShortCardNumber = formData.cardnumber.substring(0, 5);
    ShortCardNumber = ShortCardNumber + "**** **** ****";

    const step3 = document.getElementById('step-3');
    step3.innerHTML += `
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

