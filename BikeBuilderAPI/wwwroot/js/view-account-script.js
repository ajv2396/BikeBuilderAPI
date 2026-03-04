/*
    view-account-script.js

    This script controls the View Account page of the Bike Builder system.
    It loads and displays the logged-in user's personal details, saved bike
    builds, and order history. It also handles the following actions on
    saved bikes: deleting a build, adding a saved build directly to the
    basket, and editing a saved build (redirecting to the builder with the
    build pre-loaded). Orders can be deleted once they have been delivered.
*/

let LoggedInAccountID = null;   // Stores the account ID of the currently logged-in user


//Get details from user_session.json
fetch('user_session.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);

        // Extract user details from the session data
        const FirstName = data.FirstName;
        const LastName = data.LastName;
        LoggedInAccountID = data.AccountId;
        const Email = data.Email;

        // Populate the account info section with the logged-in user's details
        document.getElementById('FirstName').textContent = FirstName;
        document.getElementById('LastName').textContent = LastName;
        document.getElementById('Email').textContent = Email;
        document.getElementById('ID').textContent = LoggedInAccountID;

        // Load orders only after session is confirmed, so LoggedInAccountID is available for filtering
        LoadUserOrders();
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    })

//---------------------LOAD ORDERS-------------------------

// Fetches user_orders.json and renders only orders belonging to the logged-in user
function LoadUserOrders() {
    fetch('user_orders.json')
        .then(res => {
            if (!res.ok) throw new Error("Failed to load orders");
            return res.json();
        })
        .then(orders => {
            const container = document.getElementById('OrdersContainer');
            container.innerHTML = "";

            // Handle non-array response (e.g. empty or malformed JSON)
            if (!Array.isArray(orders)) {
                container.innerHTML = "<p>No orders found.</p>";
                return;
            }

            // Filter orders to only show those belonging to the logged-in user
            const userOrders = orders.filter(
                o => o.AccountID === LoggedInAccountID
            );

            if (userOrders.length === 0) {
                container.innerHTML = "<p>You have no orders yet.</p>";
                return;
            }

            // Create and append a card element for each of the user's orders
            userOrders.forEach(order => {
                container.appendChild(CreateOrderCard(order));
            });
        })
        .catch(err => {
            console.error("Order load error:", err);
        });
}

/*
    Creates and returns a DOM element for a single order.
    Displays the order number, total price, placement date, and delivery status.
    If the estimated delivery date has passed, shows "Delivered" and a delete button.
    If still in transit, shows the estimated delivery date instead.
*/
function CreateOrderCard(order) {
    const card = document.createElement("div");
    card.classList.add("order-card");

    const createdDate = new Date(order.CreatedAt);
    const deliveryDate = new Date(order.EstimatedDeliveryDate);
    const today = new Date();

    // Determine if the order has been delivered by comparing dates
    const delivered = today >= deliveryDate;

    // Build the status display: "Delivered" if past delivery date, otherwise show estimated date
    const statusHTML = delivered
        ? `<span class="delivered">Delivered</span>`
        : `<span class="in-transit">Estimated delivery: ${deliveryDate.toLocaleDateString()}</span>`;

    card.innerHTML = `
        <h3>Order ${order.OrderNumber}</h3>
        <p><strong>Total:</strong> &pound;${order.TotalPrice}.00</p>
        <p><strong>Placed:</strong> ${createdDate.toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${statusHTML}</p>

        ${delivered ? `
            <button class="delete-order-btn" data-order-id="${order.OrderID}">
                Delete Order
            </button>
        ` : ""}
    `;

    return card;
}


//---------------------LOAD BIKE PARTS----------------------

/*
    Fetches a bike parts JSON file and returns:
        - parts: the full flat list of all parts
        - byType: parts grouped by PartType category
*/
async function LoadParts(file) {
    const resp = await fetch(file);
    const parts = await resp.json();

    const byType = parts.reduce((acc, p) => {
        (acc[p.PartType] = acc[p.PartType] || []).push(p);
        return acc;
    }, {});
    return { parts, byType };
}

//--------------------CALCULATE TOTAL-----------------------

// Sums the Price of all resolved part objects and returns the total
function CalculateBikeTotal(parts) {
    let total = 0;
    Object.values(parts).forEach(p => {
        if (p && p.Price) total += p.Price;
    });
    return total;
}

//---------------Get details from user_saves.json-----------

/*
    Loads the logged-in user's saved bike builds from user_saves.json.
    For each saved bike, looks up all part details from the correct parts JSON,
    builds a layered bike image preview, and renders a card with part info
    and action buttons (Delete, Add to Basket, Edit).
*/
fetch('user_saves.json')
    .then(async (response) => {
        if (!response.ok) throw new Error('Response was not ok');
        return response.json();
    })
    .then(async (data) => {
        const container = document.getElementById('SavedBikesContainer');

        // Ensure the data is an array before iterating
        if (!Array.isArray(data)) {
            console.warn("Data is not an array");
            return;
        }

        const PartsCache = {};  // Cache loaded parts files per bike type to avoid redundant fetches

        for (const [index, bike] of data.entries()) {

            let BikeType;       // Human-readable bike type label
            let BikeImgPath;    // Image folder name for this bike type

            // Convert numeric bike type ID to readable label and image folder name
            switch (bike.BikeType) {
                case 1: BikeType = "Enduro";
                    BikeImgPath = "Enduro";
                    break;
                case 2: BikeType = "Downhill";
                    BikeImgPath = "DH";
                    break;
                case 3: BikeType = "Dirt Jumper";
                    BikeImgPath = "DJ";
                    break;
                default: BikeType = "Unknown";
            }

            // Determine the correct parts JSON file for this bike type
            let FilePath;
            switch (bike.BikeType) {
                case 1: FilePath = "bike-parts/enduro_parts.json"; break;
                case 2: FilePath = "bike-parts/dh_parts.json"; break;
                case 3: FilePath = "bike-parts/dj_parts.json"; break;
                default: FilePath = null;
            }

            // Skip this bike if no valid file path was determined
            if (!FilePath) {
                console.warn(`Unknown bike type ${bike.BikeType}`);
                continue;
            }

            // Load and cache the parts file for this bike type if not already loaded
            if (!PartsCache[bike.BikeType]) {
                PartsCache[bike.BikeType] = await LoadParts(FilePath);
            }
            const parts = PartsCache[bike.BikeType].parts;

            // Helper to find a part by ID, returning an empty object if not found
            const findPart = (id) => parts.find(p => p.Id === id) || {};

            //get info about each part from database
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

            // Dirt Jumpers have no rear shock
            if (bike.BikeType == "Dirt Jumper") {
                ShockPart.Name = "No shock"
            }

            // Extract the frame filename without extension for use in frame-specific image paths
            const FrameSelected = FramePart.ImagePath.slice(0, -4);

            // Create the bike card container element
            const BikeCard = document.createElement('div');
            BikeCard.classList.add('bike-card');

            // Store the full bike data object on the card element so action buttons can access it
            BikeCard.dataset.bike = JSON.stringify(bike);

            // Get today's date in YYYY-MM-DD format for comparing against the bike's save date
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const TodaysDate = `${year}-${month}-${day}`;

            // Format the save date: show time only if saved today, otherwise show the date
            let BikeSaveDate = bike.SavedAt.substring(0, 10);
            if (TodaysDate === BikeSaveDate) {
                BikeSaveDate = bike.SavedAt.substring(11, 16);  // Extract HH:MM from the timestamp
            }

            let BikeDisplayHTML = "";

            // Build layered bike preview HTML — layer order differs per bike type
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
                    <`;
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

            // Inject the layered image preview and part details list into the card
            // Falls back to raw ID values if a part name is not found
            BikeCard.innerHTML = `
            <h3>Bike #${index + 1}</h3>
            <br/>
            <div id="bike-display">
               ${BikeDisplayHTML}
            </div>
            <div class="bike-display-data">
              <p><strong>Type:</strong> ${BikeType}</p>
              <p><strong>Frame:</strong> ${FramePart.Name}</p>
              <p><strong>Fork:</strong> ${ForkPart.Name || bike.Fork}</p>
              <p><strong>Shock:</strong> ${ShockPart.Name || bike.Shock}</p>
              <p><strong>Wheels:</strong> ${WheelsPart.Name || bike.Wheels}</p>
              <p><strong>Tyres:</strong> ${TyresPart.Name || bike.Tyres}</p>
              <p><strong>Drivetrain:</strong> ${DrivetrainPart.Name || bike.Drivetrain}</p>
              <p><strong>Brakes:</strong> ${BrakesPart.Name || bike.Brakes}</p>
              <p><strong>Seatpost:</strong> ${SeatpostPart.Name || bike.Seatpost}</p>
              <p><strong>Saddle:</strong> ${SaddlePart.Name || bike.Saddle}</p>
              <p><strong>Bars:</strong> ${BarsPart.Name || bike.Bars}</p>
              <p><strong>Stem:</strong> ${StemPart.Name || bike.Stem}</p>
              <p><strong>Pedals:</strong> ${PedalsPart.Name || bike.Pedals}</p>
              <p><strong>Bike ID:</strong> ${bike.Id}</p>
              <p><strong>Created At:</strong> ${BikeSaveDate}</p>
              <br>
              <div class="button-container">
                <button class="delete-button" data-bike-id="${bike.Id}">Delete</button>
                <button class="add-to-basket-button" data-bike-id="${bike.Id}">Add to Basket</button>
                <button class="edit-button" data-bike-id="${bike.Id}">Edit</button>
              </div>
            </div>
          `;

            // Assign correct image paths to each layered image element
            BikeCard.querySelector('.frame-img').src = `images/${BikeImgPath}/frames/${FramePart.ImagePath}`;

            // Only assign shock image if the bike is not a Dirt Jumper (DJs have no rear shock)
            if (bike.BikeType !== 3) { //if bike doesnt equal dirt jumper then display shock. so if it is a dirt jumper, the shocks arent displayed
                BikeCard.querySelector('.shock-img').src = `images/${BikeImgPath}/frame-specific/shocks/${ShockPart.ImagePath}_${FrameSelected}.png`;
            }

            BikeCard.querySelector('.fork-img').src = `images/${BikeImgPath}/forks/${ForkPart.ImagePath}`;
            BikeCard.querySelector('.wheels-img').src = `images/${BikeImgPath}/wheels/${WheelsPart.ImagePath}`;
            BikeCard.querySelector('.tyres-img').src = `images/${BikeImgPath}/tyres/${TyresPart.ImagePath}`;
            BikeCard.querySelector('.drivetrain-img').src = `images/${BikeImgPath}/drivetrains/${DrivetrainPart.ImagePath}.png`;

            // Frame-specific parts use a combined path of part image + selected frame name
            BikeCard.querySelector('.brakes-img').src = `images/${BikeImgPath}/frame-specific/brakes/${BrakesPart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.seatpost-img').src = `images/${BikeImgPath}/frame-specific/seatposts/${SeatpostPart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.saddle-img').src = `images/${BikeImgPath}/frame-specific/saddles/${SaddlePart.ImagePath}_${FrameSelected}.png`;

            BikeCard.querySelector('.bars-img').src = `images/${BikeImgPath}/bars/${BarsPart.ImagePath}`;
            BikeCard.querySelector('.stem-img').src = `images/${BikeImgPath}/stems/${StemPart.ImagePath}`;
            BikeCard.querySelector('.pedals-img').src = `images/${BikeImgPath}/pedals/${PedalsPart.ImagePath}`;

            // Drivetrain rear uses a "-rear" variant of the same drivetrain image filename
            BikeCard.querySelector('.drivetrain-rear-img').src = `images/${BikeImgPath}/drivetrains/${DrivetrainPart.ImagePath}-rear.png`;

            // Add the completed bike card to the saved bikes container
            container.appendChild(BikeCard);
        }
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });


// ----------------------- DELETE BIKE FROM USERS SAVED BIKES --------------------------

// Uses event delegation on the container to handle delete button clicks for any bike card
document.getElementById('SavedBikesContainer').addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('delete-button')) {
        const SelectedBikeCard = event.target.closest('.bike-card');
        if (SelectedBikeCard) {
            // Read the bike ID stored in the delete button's data attribute
            const bikeId = event.target.dataset.bikeId; //get the bikes id thats being deleted from the card

            const DeleteData = {
                BikeID: bikeId
            };

            // Send delete request to the backend API
            fetch("https://localhost:7165/api/bikes/delete-bike", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(DeleteData)
            })
                .then(res => {
                    if (res.ok) {
                        alert("Bike Deleted!");
                        //REFRESH THE USER SAVES FROM DATABASE AND REFRESH PAGE
                        fetch("/api/logout/refresh-user-saves", { method: "POST" });
                        window.location.reload();

                    } else {
                        alert("Delete failed");
                    }
                })
                .catch(err => {
                    console.error("Error deleting bike:", err);
                });
        }
    }
});

// ----------------------- ADD TO BASKET --------------------------

// Uses event delegation on the container to handle add-to-basket button clicks for any bike card
document
    .getElementById('SavedBikesContainer')
    .addEventListener('click', async (event) => {

        if (!event.target.classList.contains('add-to-basket-button')) return;

        const card = event.target.closest('.bike-card');
        if (!card) return;

        // Retrieve the full bike data stored on the card element
        const bike = JSON.parse(card.dataset.bike);

        // Map bike type ID to its corresponding parts JSON file
        const fileMap = {
            1: "bike-parts/enduro_parts.json",
            2: "bike-parts/dh_parts.json",
            3: "bike-parts/dj_parts.json"
        };

        // Load parts for this bike type to resolve prices for total calculation
        const { parts } = await LoadParts(fileMap[bike.BikeType]);

        const find = (id) => parts.find(p => p.Id === id) || {};

        // Resolve each part ID to its full part object so prices can be summed
        const ResolvedParts = {
            frame: find(bike.Frame),
            shock: find(bike.Shock),
            fork: find(bike.Fork),
            wheels: find(bike.Wheels),
            tyres: find(bike.Tyres),
            drivetrain: find(bike.Drivetrain),
            brakes: find(bike.Brakes),
            seatpost: find(bike.Seatpost),
            saddle: find(bike.Saddle),
            bars: find(bike.Bars),
            stem: find(bike.Stem),
            pedals: find(bike.Pedals),
        };

        // Calculate the total price from all resolved part prices
        const total = CalculateBikeTotal(ResolvedParts);

        // Build the basket payload with account ID, all part IDs, and the calculated total
        const BasketData = {
            AccountId: LoggedInAccountID,
            Bike: {
                BikeType: bike.BikeType,
                Frame: bike.Frame,
                Shock: bike.Shock,
                Fork: bike.Fork,
                Wheels: bike.Wheels,
                Tyres: bike.Tyres,
                Drivetrain: bike.Drivetrain,
                Brakes: bike.Brakes,
                Seatpost: bike.Seatpost,
                Saddle: bike.Saddle,
                Bars: bike.Bars,
                Stem: bike.Stem,
                Pedals: bike.Pedals,
                Total: total
            }
        };

        // Send the basket item to the backend API
        fetch("https://localhost:7165/api/basket/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(BasketData)
        })
            .then(res => {
                if (!res.ok) throw new Error("Add failed");
                // Refresh the basket count in the nav bar
                LoadBasket();
            })
            .catch(err => {
                console.error(err);
                alert("Error adding to basket");
            });
    });


// ----------------------- EDIT BIKE --------------------------

// Uses event delegation on the container to handle edit button clicks for any bike card
document
    .getElementById('SavedBikesContainer')
    .addEventListener('click', (event) => {

        if (!event.target.classList.contains('edit-button')) return;

        const card = event.target.closest('.bike-card');
        if (!card) return;

        // Retrieve the full bike data stored on the card element
        const bike = JSON.parse(card.dataset.bike);

        // Store the saved bike config in localStorage so builder-script.js can restore it
        localStorage.setItem("editBike", JSON.stringify({
            BikeType: bike.BikeType,
            Frame: bike.Frame,
            Shock: bike.Shock,
            Fork: bike.Fork,
            Wheels: bike.Wheels,
            Tyres: bike.Tyres,
            Drivetrain: bike.Drivetrain,
            Brakes: bike.Brakes,
            Seatpost: bike.Seatpost,
            Saddle: bike.Saddle,
            Bars: bike.Bars,
            Stem: bike.Stem,
            Pedals: bike.Pedals
        }));

        // Map numeric bike type ID to the string key used in the builder URL
        const typeMap = { 1: "enduro", 2: "dh", 3: "dj" };

        // Navigate to the builder with the bike type and fromsave flag so the build is restored
        window.location.href =
            `builder.html?bike=${typeMap[bike.BikeType]}&fromsave=true`;
    });

//---------------- REMOVE ORDER -------------------

// Uses event delegation on the orders container to handle delete button clicks
document.getElementById("OrdersContainer").addEventListener("click", function (event) {
    if (!event.target.classList.contains("delete-order-btn")) return;

    // Read the order ID stored in the delete button's data attribute
    const orderId = parseInt(event.target.dataset.orderId);

    // Confirm the deletion with the user before proceeding
    if (!confirm("Delete this delivered order?")) return;

    // Send the delete request to the backend API
    fetch("https://localhost:7165/api/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ OrderID: orderId })
    })
        .then(res => {
            if (!res.ok) throw new Error("Delete failed");

            // Re-export the updated orders list to JSON so the page reflects the deletion
            return fetch("https://localhost:7165/api/orders/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(LoggedInAccountID)
            });
        })
        .then(res => {
            if (!res.ok) throw new Error("Export failed");

            alert("Order deleted");
            window.location.reload();
        })
        .catch(err => {
            console.error(err);
            alert("Error deleting order");
        });
});