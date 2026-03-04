/*
    basket-script.js

    This script controls the Basket page of the Bike Builder system.
    It loads the logged-in user's basket items, dynamically renders full
    bike previews, calculates totals, allows item removal, and handles
    checkout and navigation.
*/

let UserBasket;      // Stores basket items belonging to the logged-in user
let PageRedirect;    // Stores the page the user came from (used for back navigation)


//--------------------GET WHERE REDIRECT IS FROM------------------

// Extract query string parameters from URL
const qs = new URLSearchParams(window.location.search);

// Retrieve the "originator" parameter to know where user navigated from
PageRedirect = qs.get("originator");


//---------------------GET USER SESSION----------------------

// Stores the currently logged-in account ID
let LoggedInAccountID = null;

// Fetch session data to determine which user is logged in
fetch('user_session.json')
    .then(response => {
        if (!response.ok) throw new Error('Response was not ok');
        return response.json();
    })
    .then(data => {
        // Save AccountId for filtering basket items to only show the logged-in user's items
        LoggedInAccountID = data.AccountId;
    })
    .catch(error => {
        console.error('Error fetching session:', error);
    });


//---------------------LOAD BIKE PARTS----------------------

/*
    Loads a JSON file containing bike parts for a specific bike type.
    Returns:
        - parts: full list of parts
        - byType: parts grouped by PartType (e.g., frames, forks)
*/
async function LoadParts(file) {
    const resp = await fetch(file);
    const parts = await resp.json();

    // Group parts by their category (PartType) into a dictionary for easier lookup
    const byType = parts.reduce((acc, p) => {
        (acc[p.PartType] = acc[p.PartType] || []).push(p);
        return acc;
    }, {});

    return { parts, byType };
}


//---------------------LOAD BASKET----------------------

/*
    Fetches basket JSON file and dynamically builds the basket page.
    - Filters items by logged-in user
    - Calculates total price
    - Generates full bike preview display
*/
fetch('basket/user-basket.json', { cache: "no-store" })

    .then(async (response) => {
        if (!response.ok) throw new Error('Response was not ok');
        return response.json();
    })

    .then(async (data) => {

        const container = document.getElementById('BasketItems');
        container.innerHTML = ""; // Clear previous content

        // Ensure returned basket data is an array
        if (!Array.isArray(data)) {
            console.warn("Basket data is not an array");
            return;
        }

        const PartsCache = {}; // Cache part files per bike type to avoid loading the same file multiple times

        // Only keep basket items belonging to the logged-in user
        UserBasket = data.filter(item => item.AccountId === LoggedInAccountID);

        let basketTotal = 0;

        // Calculate total price of all bikes in basket
        UserBasket.forEach(item => {
            if (item.Bike && item.Bike.Total) {
                basketTotal += item.Bike.Total;
            }
        });

        // Update total price display element with calculated total
        const TotalElement = document.getElementById("BasketTotal");
        if (TotalElement) {
            TotalElement.textContent = `Total: £${basketTotal}.00`;
        }

        // If basket is empty, display message and stop execution
        if (!UserBasket || UserBasket.length === 0) {
            container.innerHTML = `<p class="bike-type">Basket is Empty.</p>`;
            return;
        }

        // Loop through each basket item and render it as a card on the page
        for (const [index, basketItem] of UserBasket.entries()) {

            const bike = basketItem.Bike;

            let BikeType;       // Human-readable bike type label (e.g. "Enduro")
            let BikeImgPath;    // Folder name used in image file paths (e.g. "DH")

            // Convert numeric bike type to readable string and folder name
            switch (bike.BikeType) {
                case 1:
                    BikeType = "Enduro";
                    BikeImgPath = "Enduro";
                    break;
                case 2:
                    BikeType = "Downhill";
                    BikeImgPath = "DH";
                    break;
                case 3:
                    BikeType = "Dirt Jumper";
                    BikeImgPath = "DJ";
                    break;
                default:
                    BikeType = "Unknown";
            }

            // Determine correct JSON parts file for selected bike type
            let FilePath;
            switch (bike.BikeType) {
                case 1: FilePath = "bike-parts/enduro_parts.json"; break;
                case 2: FilePath = "bike-parts/dh_parts.json"; break;
                case 3: FilePath = "bike-parts/dj_parts.json"; break;
                default: FilePath = null;
            }

            // Skip this basket item if no valid file path could be determined
            if (!FilePath) continue;

            // Load parts file once per bike type (caching avoids redundant fetches)
            if (!PartsCache[bike.BikeType]) {
                PartsCache[bike.BikeType] = await LoadParts(FilePath);
            }

            const parts = PartsCache[bike.BikeType].parts;

            // Helper function to find a part object by its ID, returning an empty object if not found
            const findPart = (id) => parts.find(p => p.Id === id) || {};

            // Retrieve each selected part object using its stored ID
            const FramePart = findPart(bike.Frame);
            const ForkPart = findPart(bike.Fork);
            const ShockPart = findPart(bike.Shock);
            const WheelsPart = findPart(bike.Wheels);
            const TyresPart = findPart(bike.Tyres);
            const DrivetrainPart = findPart(bike.Drivetrain);
            const BrakesPart = findPart(bike.Brakes);
            const SeatpostPart = findPart(bike.Seatpost);
            const SaddlePart = findPart(bike.Saddle);
            const BarsPart = findPart(bike.Bars);
            const StemPart = findPart(bike.Stem);
            const PedalsPart = findPart(bike.Pedals);

            // Dirt Jumpers do not use rear shocks
            if (bike.BikeType === 3) {
                ShockPart.Name = "No shock";
            }

            // Extract frame image filename without extension, used to build frame-specific image paths
            const FrameSelected = FramePart.ImagePath.slice(0, -4);

            // Create the container element for this basket item card
            const BikeCard = document.createElement('div');
            BikeCard.className = 'basket-item';

            let BikeDisplayHTML;

            // Build layered bike preview HTML structure — layer order differs per bike type
            // to ensure parts are rendered in the correct visual depth order
            switch (bike.BikeType) {
                case 1: // Enduro
                    BikeDisplayHTML = `
                        <img class="brakes-img" />
                        <img class="tyres-img" />
                        <img class="shock-img" />
                        <img class="wheels-img" />
                        <img class="fork-img" />
                        <img class="saddle-img" />
                        <img class="seatpost-img" />
                        <img class="drivetrain-rear-img" />
                        <img class="frame-img" />
                        <img class="stem-img" />
                        <img class="drivetrain-img" />
                        <img class="bars-img" />
                        <img class="pedals-img" />
                    `;
                    break;

                case 2: // Downhill
                    BikeDisplayHTML = `
                        <img class="brakes-img" />
                        <img class="tyres-img" />
                        <img class="shock-img" />
                        <img class="wheels-img" />
                        <img class="saddle-img" />
                        <img class="seatpost-img" />
                        <img class="drivetrain-rear-img" />
                        <img class="stem-img" />
                        <img class="bars-img" />
                        <img class="frame-img" />
                        <img class="fork-img" />
                        <img class="drivetrain-img" />
                        <img class="pedals-img" />
                    `;
                    break;

                case 3: // Dirt Jumper
                    BikeDisplayHTML = `
                        <img class="brakes-img" />
                        <img class="tyres-img" />
                        <img class="wheels-img" />
                        <img class="seatpost-img" />
                        <img class="saddle-img" />
                        <img class="drivetrain-rear-img" />
                        <img class="stem-img" />
                        <img class="bars-img" />
                        <img class="fork-img" />
                        <img class="frame-img" />
                        <img class="drivetrain-img" />
                        <img class="pedals-img" />
                    `;
                    break;
            }

            // Inject the layered bike preview HTML and part details into the basket card
            BikeCard.innerHTML = `
            <div class="bike-preview">
               ${BikeDisplayHTML}
            </div>
            <br/>
                <div class="bike-display-data">
                    <h3 class="bike-title">Bike ${index + 1} : £${bike.Total}.00</h3>
                    <p> </p>
                    <p class="bike-type"><strong>Type:</strong> ${BikeType}</p>
                    <p><strong>Frame:</strong> ${FramePart.Name}</p>
                    <p><strong>Fork:</strong> ${ForkPart.Name}</p>
                    <p><strong>Shock:</strong> ${ShockPart.Name}</p>
                    <p><strong>Wheels:</strong> ${WheelsPart.Name}</p>
                    <p><strong>Tyres:</strong> ${TyresPart.Name}</p>
                    <p><strong>Drivetrain:</strong> ${DrivetrainPart.Name}</p>
                    <p><strong>Brakes:</strong> ${BrakesPart.Name}</p>
                    <p><strong>Seatpost:</strong> ${SeatpostPart.Name}</p>
                    <p><strong>Saddle:</strong> ${SaddlePart.Name}</p>
                    <p><strong>Bars:</strong> ${BarsPart.Name}</p>
                    <p><strong>Stem:</strong> ${StemPart.Name}</p>
                    <p><strong>Pedals:</strong> ${PedalsPart.Name}</p>
                    <p> </p>
                    <button class="remove-btn" data-id="${basketItem.Id}">
                        Remove from basket
                    </button>
                </div>
            `;

            // Assign correct image paths for each layer of the bike preview
            BikeCard.querySelector('.frame-img').src = `images/${BikeImgPath}/frames/${FramePart.ImagePath}`;

            // Only assign shock image if bike is not a Dirt Jumper (DJs have no rear shock)
            if (bike.BikeType !== 3) { // If bike type is not a dirt jumper, then assign image path for shock. If it is a dirt jumper then no shock image is assigned.
                BikeCard.querySelector('.shock-img').src =
                    `images/${BikeImgPath}/frame-specific/shocks/${ShockPart.ImagePath}_${FrameSelected}.png`;
            }

            BikeCard.querySelector('.fork-img').src = `images/${BikeImgPath}/forks/${ForkPart.ImagePath}`;
            BikeCard.querySelector('.wheels-img').src = `images/${BikeImgPath}/wheels/${WheelsPart.ImagePath}`;
            BikeCard.querySelector('.tyres-img').src = `images/${BikeImgPath}/tyres/${TyresPart.ImagePath}`;
            BikeCard.querySelector('.drivetrain-img').src = `images/${BikeImgPath}/drivetrains/${DrivetrainPart.ImagePath}.png`;

            // Frame-specific parts use a combined path of part image + selected frame name
            BikeCard.querySelector('.brakes-img').src =
                `images/${BikeImgPath}/frame-specific/brakes/${BrakesPart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.seatpost-img').src =
                `images/${BikeImgPath}/frame-specific/seatposts/${SeatpostPart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.saddle-img').src =
                `images/${BikeImgPath}/frame-specific/saddles/${SaddlePart.ImagePath}_${FrameSelected}.png`;

            BikeCard.querySelector('.bars-img').src = `images/${BikeImgPath}/bars/${BarsPart.ImagePath}`;
            BikeCard.querySelector('.stem-img').src = `images/${BikeImgPath}/stems/${StemPart.ImagePath}`;
            BikeCard.querySelector('.pedals-img').src = `images/${BikeImgPath}/pedals/${PedalsPart.ImagePath}`;

            // Drivetrain rear image uses a separate "-rear" variant of the same drivetrain image
            BikeCard.querySelector('.drivetrain-rear-img').src =
                `images/${BikeImgPath}/drivetrains/${DrivetrainPart.ImagePath}-rear.png`;

            // Add the completed bike card to the basket container
            container.appendChild(BikeCard);
        }
    })
    .catch(error => {
        console.error('Error fetching basket:', error);
    });


//---------------------REMOVE FROM BASKET----------------------

/*
    Handles removal of basket items.
    Sends a POST request to backend API to delete the selected item.
*/
document.getElementById('BasketItems').addEventListener('click', function (event) {

    // Check the clicked element is a remove button
    if (event.target.classList.contains('remove-btn')) {

        // Retrieve basket item ID stored in the button's data attribute
        const BasketID = event.target.dataset.id;

        // Send delete request to backend API with the basket item's ID
        fetch("https://localhost:7165/api/basket/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Id: BasketID })
        })
            .then(res => {
                if (res.ok) {
                    // Reload the page to reflect the updated basket
                    window.location.reload();
                } else {
                    alert("Failed to remove");
                }
            })
            .catch(err => console.error(err));
    }
});


//---------------------CHECKOUT----------------------

/*
    Handles checkout button click.
    - Prevents checkout if basket empty
    - Calculates totals
    - Stores summary in localStorage
    - Redirects to checkout page
*/
document.getElementById('checkout-btn').addEventListener('click', () => {

    // Prevent checkout if the basket is empty
    if (!UserBasket || UserBasket.length === 0) {
        alert("Basket is empty.");
        return;
    }

    // Sum up total price across all basket items
    const totalPrice = UserBasket.reduce((sum, item) => sum + (item.Bike.Total || 0), 0);
    const itemsCount = UserBasket.length;

    // Store checkout summary in localStorage so checkout.html can read it
    localStorage.setItem("checkoutSummary", JSON.stringify({
        totalPrice,
        itemsCount
    }));

    // Navigate to the checkout page
    window.location.href = "checkout.html";
});


//-------------------BACK BUTTON---------------------

/*
    Handles navigation back to previous page.
    If originator exists, return there.
    Otherwise default to home page.
*/
document.getElementById('back-btn').addEventListener('click', () => {

    if (PageRedirect != null) {

        // If the user came from the builder, append query parameter so builder knows to restore state
        if (PageRedirect == "builder.html") {
            window.location.href = PageRedirect + "?frombasket=true";
        }
        else {
            // Otherwise navigate directly back to the originating page
            window.location.href = PageRedirect;
        }

    }
    else {
        // Default fallback if no originator was set
        window.location.href = "index.html";
    }
});