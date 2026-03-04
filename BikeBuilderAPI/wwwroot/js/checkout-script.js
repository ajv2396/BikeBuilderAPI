/*
    checkout-script.js

    This script controls the multi-step Checkout page of the Bike Builder system.
    It manages step-by-step navigation through the checkout flow (delivery details,
    payment details, order confirmation, and order success), validates form inputs
    including a UK postcode regex check, collects and displays entered form data,
    submits the order to the backend API, clears the basket on success, and
    highlights any empty or invalid fields to guide the user.
*/


//--------------------------GET ACCOUNT ID ---------------------
let LoggedInAccountID = null;   // Stores the account ID of the currently logged-in user
let sessionLoaded = false;      // Tracks whether the session has finished loading before allowing order submission

// Fetch the user session to get the logged-in account ID
fetch("user_session.json")
    .then(res => {
        if (!res.ok) throw new Error("Failed to load session");
        return res.json();
    })
    .then(data => {
        LoggedInAccountID = data.AccountId;
        sessionLoaded = true;   // Mark session as loaded so ProcessPayment can safely proceed
    })
    .catch(err => console.error("Session error:", err));


//-------------------------------------STEPS MANAGEMENT-------------------------------------
const panels = document.querySelectorAll('.step-panel');    // All checkout step panel elements
const NextBtn = document.querySelector(".next-btn");        // The primary next/place order/finish button
let currentStep = 0;                                        // Index of the currently displayed checkout step

// Attach click handler to all next buttons (one per panel)
document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {

        // Collect current form field values into formData before any validation
        CollectFormData();

        // --- Step 0: Delivery details validation ---
        if (currentStep === 0) {
            // Highlight any empty required fields in red
            ['firstname', 'lastname', 'address1', 'city', 'postcode'].forEach(HighlightEmptyField);

            // Stop progression if any required delivery fields are missing
            if (!formData.firstname || !formData.lastname || !formData.address1 || !formData.city || !formData.postcode) {
                return;
            }

            //--------------------------------------------------------------------
            // Validate the postcode using a UK postcode regex
            // Normalise input: trim whitespace, uppercase, and collapse multiple spaces
            const Postcode = formData.postcode.trim().toUpperCase().replace(/\s+/, ' ');
            const regex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][ABD-HJLNP-UW-Z]{2}$/i;

            const IsValidPostcode = regex.test(Postcode);

            if (!IsValidPostcode) {
                // Highlight postcode field as invalid and show error label
                HighlightPostcodeBox();
                return;
            }
            //--------------------------------------------------------------------

        }

        // --- Step 1: Payment details validation ---
        if (currentStep === 1) {
            // Highlight any empty required payment fields in red
            ['cardholder', 'cardnumber', 'date', 'verification'].forEach(HighlightEmptyField);

            // Stop progression if no payment method radio button has been selected
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                alert('Please select a payment method.');
                return;
            }

            // Stop progression if any required card fields are missing
            if (!formData.cardholder || !formData.cardnumber || !formData.date || !formData.cvv) {
                return;
            }
        }

        // --- Final step: Finish button navigates back to home and clears checkout data ---
        if (currentStep === panels.length - 1 && NextBtn.textContent === "Finish") {
            localStorage.removeItem("checkoutSummary");
            window.location.href = "index.html";
            return;
        }

        // --- Place Order step: trigger payment processing instead of advancing normally ---
        if (NextBtn.textContent === "Place Order") {
            ProcessPayment();
            return;
        }

        // Advance to the next step if not on the last panel
        if (currentStep < panels.length - 1) {
            panels[currentStep].style.display = 'none';
            currentStep++;
            panels[currentStep].style.display = 'block';
        }

        // Step 2: Fill the confirmation panel with the collected form data
        if (currentStep === 2) {
            FillConfirmation();
            return;
        } else if (currentStep === 3) {
            // On the final step, rename the button to "Finish", hide back button,
            // and right-align the footer so Finish sits at the end of the panel
            document.querySelector(".next-btn").textContent = "Finish";
            document.querySelector(".back-btn").style.display = "none";
            const footer = document.querySelector(".panel-footer");
            footer.style.justifyContent = "flex-end";
        }
    });
});

// Attach click handler to all back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentStep > 0) {
            // Reset button text when navigating back from the confirmation or order steps
            if (currentStep === 3) {
                document.querySelector(".next-btn").textContent = "Next Step";
            }
            if (currentStep === 2) {
                document.querySelector(".next-btn").textContent = "Next Step";
            }

            // Navigate back one step
            panels[currentStep].style.display = 'none';
            currentStep--;
            panels[currentStep].style.display = 'block';
        }
    });
});

//----------------------------------SAVING DATA ENTERED----------------------------------

// Load the checkout summary (total price and item count) stored by basket-script.js
const checkoutSummary = JSON.parse(localStorage.getItem("checkoutSummary") || "{}");

// formData stores all collected checkout inputs and summary values
const formData = {};

// Pre-populate price and item count from the basket summary
formData.totalprice = checkoutSummary.totalPrice || 0;
formData.itemsnumber = checkoutSummary.itemsCount || 0;

// Reads all form field values from the DOM and stores them in formData
function CollectFormData() {
    formData.firstname = document.getElementById('firstname').value;
    formData.lastname = document.getElementById('lastname').value;
    formData.address1 = document.getElementById('address1').value;
    formData.address2 = document.getElementById('address2').value;
    formData.city = document.getElementById('city').value;
    formData.postcode = document.getElementById('postcode').value;
    // Use optional chaining in case no payment method is selected yet
    formData.paymentMethod = document.querySelector('input[name="payment"]:checked')?.id || '';
    formData.cardholder = document.getElementById('cardholder').value;
    formData.cardnumber = document.getElementById('cardnumber').value;
    formData.date = document.getElementById('date').value;
    formData.cvv = document.getElementById('verification').value;
}

//--------------------------FILL CONFIRMATION PAGE WITH GATHERED DATA--------------------------

/*
    Populates the confirmation panel (step 3) with a summary of the user's
    entered delivery info, payment info, delivery method, and total price.
    Also changes the next button to "Place Order" to trigger payment on click.
    Card number is masked to show only the first 5 digits for security.
*/
function FillConfirmation() {

    // Change button label so the next click triggers ProcessPayment instead of advancing
    document.querySelector(".next-btn").textContent = "Place Order";

    // Mask card number: show only first 5 characters followed by placeholder asterisks
    let ShortCardNumber = formData.cardnumber.substring(0, 5);
    ShortCardNumber = ShortCardNumber + "**** **** ****";

    const step3 = document.getElementById('step-3');

    // Inject the confirmation summary HTML into the confirmation panel
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

/*
    Handles order submission:
        1. Shows a loading spinner while processing
        2. Validates that the session is loaded and the user is logged in
        3. Sends the order to the backend API to create an order record
        4. Exports the updated order list to JSON
        5. Clears the basket on the server
        6. Removes the checkout summary from localStorage
        7. Advances to the final confirmation step
*/
function ProcessPayment() {

    const step3 = document.getElementById('step-3');

    // Replace confirmation panel content with a processing message and spinner
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

    // Guard: ensure session has finished loading before submitting the order
    if (!sessionLoaded) {
        alert("Please wait, loading user session...");
        return;
    }

    // Guard: ensure a logged-in account ID is available
    if (!LoggedInAccountID) {
        alert("User not logged in");
        return;
    }

    // Build the order payload with the user's account ID and basket total
    const orderData = {
        accountID: LoggedInAccountID,   // from session
        totalPrice: formData.totalprice
    };

    // Step 1: Create the order record in the database
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

            // Step 2: Re-export the user's orders to JSON so the account page reflects the new order
            return fetch("https://localhost:7165/api/orders/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(LoggedInAccountID)
            });
        })
        .then(res => {
            if (!res.ok) throw new Error("Order export failed");

            // Step 3: Clear the server-side basket JSON file now the order has been placed
            return fetch("https://localhost:7165/api/basket/clear", {
                method: "POST"
            });
        })
        .then(res => {
            if (!res.ok) throw new Error("Basket clear failed");

            // Step 4: Remove the checkout summary from localStorage
            localStorage.removeItem("checkoutSummary");

            // Step 5: Advance to the final order success step
            panels[currentStep].style.display = 'none';
            currentStep++;
            panels[currentStep].style.display = 'block';

            // Update UI for the final step: rename button to Finish, hide back, right-align footer
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

// Highlights a form field with a red border if it is empty, or resets the border if filled
function HighlightEmptyField(id) {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
        el.style.border = '1px solid red';
    } else {
        el.style.border = '';   // Reset to default if the field now has a value
    }
}

//--------------------------HIGHLIGHT POSTCODE BOX--------------------------

// Highlights the postcode field as invalid and shows an example error message below it
function HighlightPostcodeBox() {
    const el = document.getElementById('postcode'); // 'postcode' must be a string
    const label = document.getElementById('invalid-postcode'); // Use correct ID

    // Show the invalid postcode error label with an example of a valid format
    if (label) {
        label.textContent = "Use a Valid Postcode - E.g. WA7 5WN";
        label.style.color = 'red';
    }

    if (el) {
        el.style.border = '1px solid red';
    }
}