let UserBasket;
let PageRedirect;

//--------------------GET WHERE REDIRECT IS FROM------------------
const qs = new URLSearchParams(window.location.search);
PageRedirect = qs.get("originator")

//---------------------GET USER SESSION----------------------
let LoggedInAccountID = null;

fetch('user_session.json')
    .then(response => {
        if (!response.ok) throw new Error('Response was not ok');
        return response.json();
    })
    .then(data => {
        LoggedInAccountID = data.AccountId;
    })
    .catch(error => {
        console.error('Error fetching session:', error);
    });

//---------------------LOAD BIKE PARTS----------------------
async function LoadParts(file) {
    const resp = await fetch(file);
    const parts = await resp.json();

    const byType = parts.reduce((acc, p) => {
        (acc[p.PartType] = acc[p.PartType] || []).push(p);
        return acc;
    }, {});
    return { parts, byType };
}

//---------------------LOAD BASKET----------------------
fetch('basket/user-basket.json', { cache: "no-store" })

    .then(async (response) => {
        if (!response.ok) throw new Error('Response was not ok');
        return response.json();
    })
    .then(async (data) => {

        const container = document.getElementById('BasketItems');
        container.innerHTML = "";

        if (!Array.isArray(data)) {
            console.warn("Basket data is not an array");
            return;
        }

        const PartsCache = {};

        UserBasket = data.filter(item => item.AccountId === LoggedInAccountID);

        let basketTotal = 0;

        UserBasket.forEach(item => {
            if (item.Bike && item.Bike.Total) {
                basketTotal += item.Bike.Total;
            }
        });

        const TotalElement = document.getElementById("BasketTotal");
        if (TotalElement) {
            TotalElement.textContent = `Total: £${basketTotal}.00`;
        }



        // If the basket is empty then display this and go no further
        if (!UserBasket || UserBasket.length === 0) {
            container.innerHTML = `<p class="bike-type">Basket is Empty.</p>`;
            return;
        }


        for (const [index, basketItem] of UserBasket.entries()) {

            const bike = basketItem.Bike;

            let BikeType;
            let BikeImgPath;

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

            let FilePath;
            switch (bike.BikeType) {
                case 1: FilePath = "bike-parts/enduro_parts.json"; break;
                case 2: FilePath = "bike-parts/dh_parts.json"; break;
                case 3: FilePath = "bike-parts/dj_parts.json"; break;
                default: FilePath = null;
            }
            if (!FilePath) continue;

            if (!PartsCache[bike.BikeType]) {
                PartsCache[bike.BikeType] = await LoadParts(FilePath);
            }

            const parts = PartsCache[bike.BikeType].parts;
            const findPart = (id) => parts.find(p => p.Id === id) || {};

            // Find parts
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

            if (bike.BikeType === 3) {
                ShockPart.Name = "No shock";
            }

            const FrameSelected = FramePart.ImagePath.slice(0, -4);

            const BikeCard = document.createElement('div');
            BikeCard.className = 'basket-item';


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

            // Images (same as view-account)
            BikeCard.querySelector('.frame-img').src = `images/${BikeImgPath}/frames/${FramePart.ImagePath}`;
            if (bike.BikeType !== 3) {
                BikeCard.querySelector('.shock-img').src =
                    `images/${BikeImgPath}/frame-specific/shocks/${ShockPart.ImagePath}_${FrameSelected}.png`;
            }
            BikeCard.querySelector('.fork-img').src = `images/${BikeImgPath}/forks/${ForkPart.ImagePath}`;
            BikeCard.querySelector('.wheels-img').src = `images/${BikeImgPath}/wheels/${WheelsPart.ImagePath}`;
            BikeCard.querySelector('.tyres-img').src = `images/${BikeImgPath}/tyres/${TyresPart.ImagePath}`;
            BikeCard.querySelector('.drivetrain-img').src = `images/${BikeImgPath}/drivetrains/${DrivetrainPart.ImagePath}.png`;
            BikeCard.querySelector('.brakes-img').src =
                `images/${BikeImgPath}/frame-specific/brakes/${BrakesPart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.seatpost-img').src =
                `images/${BikeImgPath}/frame-specific/seatposts/${SeatpostPart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.saddle-img').src =
                `images/${BikeImgPath}/frame-specific/saddles/${SaddlePart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.bars-img').src = `images/${BikeImgPath}/bars/${BarsPart.ImagePath}`;
            BikeCard.querySelector('.stem-img').src = `images/${BikeImgPath}/stems/${StemPart.ImagePath}`;
            BikeCard.querySelector('.pedals-img').src = `images/${BikeImgPath}/pedals/${PedalsPart.ImagePath}`;
            BikeCard.querySelector('.drivetrain-rear-img').src =
                `images/${BikeImgPath}/drivetrains/${DrivetrainPart.ImagePath}-rear.png`;

            container.appendChild(BikeCard);
        }
    })
    .catch(error => {
        console.error('Error fetching basket:', error);
    });

//---------------------REMOVE FROM BASKET----------------------
document.getElementById('BasketItems').addEventListener('click', function (event) {
    if (event.target.classList.contains('remove-btn')) {
        const BasketID = event.target.dataset.id;

        fetch("https://localhost:7165/api/basket/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Id: BasketID })
        })
            .then(res => {
                if (res.ok) {
                    window.location.reload();
                } else {
                    alert("Failed to remove");
                }
            })
            .catch(err => console.error(err));
    }
});

//---------------------CHECKOUT----------------------
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (!UserBasket || UserBasket.length === 0) {
        alert("Basket is empty.");
        return; // stop redirect
    }

    //calculate totals
    const totalPrice = UserBasket.reduce((sum, item) => sum + (item.Bike.Total || 0), 0);
    const itemsCount = UserBasket.length;

    // save for checkout page
    localStorage.setItem("checkoutSummary", JSON.stringify({
        totalPrice,
        itemsCount
    }));
    window.location.href = "checkout.html";
});

//-------------------BACK BUTTON---------------------
document.getElementById('back-btn').addEventListener('click', () => {
    if (PageRedirect != null) {
        if (PageRedirect == "builder.html") {
            window.location.href = PageRedirect + "?frombasket=true";
        }
        else {
            window.location.href = PageRedirect;
        }
    }
    else {
        window.location.href = "index.html"; //default to index.html if pageredirect does not exist
    }
});
