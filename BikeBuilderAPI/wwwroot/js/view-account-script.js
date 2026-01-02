let LoggedInAccountID = null;


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

        const FirstName = data.FirstName;
        const LastName = data.LastName;
        LoggedInAccountID = data.AccountId;
        const Email = data.Email;

        document.getElementById('FirstName').textContent = FirstName;
        document.getElementById('LastName').textContent = LastName;
        document.getElementById('Email').textContent = Email;
        document.getElementById('ID').textContent = LoggedInAccountID;
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    })

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

//--------------------CALCULATE TOTAL-----------------------
function CalculateBikeTotal(parts) {
    let total = 0;
    Object.values(parts).forEach(p => {
        if (p && p.Price) total += p.Price;
    });
    return total;
}

//---------------Get details from user_saves.json-----------
fetch('user_saves.json')
    .then(async (response) => {
        if (!response.ok) throw new Error('Response was not ok');
        return response.json();
    })
    .then(async (data) => {
        const container = document.getElementById('SavedBikesContainer');
        if (!Array.isArray(data)) {
            console.warn("Data is not an array");
            return;
        }

        const PartsCache = {};

        for (const [index, bike] of data.entries()) {

            let BikeType;
            let BikeImgPath;
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


            let FilePath;
            switch (bike.BikeType) {
                case 1: FilePath = "bike-parts/enduro_parts.json"; break;
                case 2: FilePath = "bike-parts/dh_parts.json"; break;
                case 3: FilePath = "bike-parts/dj_parts.json"; break;
                default: FilePath = null;
            }
            if (!FilePath) {
                console.warn(`Unknown bike type ${bike.BikeType}`);
                continue;
            }

            if (!PartsCache[bike.BikeType]) {
                PartsCache[bike.BikeType] = await LoadParts(FilePath);
            }
            const parts = PartsCache[bike.BikeType].parts;

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

            if (bike.BikeType == "Dirt Jumper") {
                ShockPart.Name= "No shock"
            }

            const FrameSelected = FramePart.ImagePath.slice(0, -4);

            const BikeCard = document.createElement('div');
            BikeCard.classList.add('bike-card');

            BikeCard.dataset.bike = JSON.stringify(bike);

            //todays date
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const TodaysDate = `${year}-${month}-${day}`;

            //format saved date
            let BikeSaveDate = bike.SavedAt.substring(0, 10);
            if (TodaysDate === BikeSaveDate) {
                BikeSaveDate = bike.SavedAt.substring(11, 16);
            }

            let BikeDisplayHTML = "";

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

            BikeCard.querySelector('.frame-img').src = `images/${BikeImgPath}/frames/${FramePart.ImagePath}`;
            if (bike.BikeType !== 3) { //if bike doesnt equal dirt jumper then display shock. so if it is a dirt jumper, the shocks arent displayed
                BikeCard.querySelector('.shock-img').src = `images/${BikeImgPath}/frame-specific/shocks/${ShockPart.ImagePath}_${FrameSelected}.png`;
            }
            BikeCard.querySelector('.fork-img').src = `images/${BikeImgPath}/forks/${ForkPart.ImagePath}`;
            BikeCard.querySelector('.wheels-img').src = `images/${BikeImgPath}/wheels/${WheelsPart.ImagePath}`;
            BikeCard.querySelector('.tyres-img').src = `images/${BikeImgPath}/tyres/${TyresPart.ImagePath}`;
            BikeCard.querySelector('.drivetrain-img').src = `images/${BikeImgPath}/drivetrains/${DrivetrainPart.ImagePath}.png`;
            BikeCard.querySelector('.brakes-img').src = `images/${BikeImgPath}/frame-specific/brakes/${BrakesPart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.seatpost-img').src = `images/${BikeImgPath}/frame-specific/seatposts/${SeatpostPart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.saddle-img').src = `images/${BikeImgPath}/frame-specific/saddles/${SaddlePart.ImagePath}_${FrameSelected}.png`;
            BikeCard.querySelector('.bars-img').src = `images/${BikeImgPath}/bars/${BarsPart.ImagePath}`;
            BikeCard.querySelector('.stem-img').src = `images/${BikeImgPath}/stems/${StemPart.ImagePath}`;
            BikeCard.querySelector('.pedals-img').src = `images/${BikeImgPath}/pedals/${PedalsPart.ImagePath}`;
            BikeCard.querySelector('.drivetrain-rear-img').src = `images/${BikeImgPath}/drivetrains/${DrivetrainPart.ImagePath}-rear.png`;

            container.appendChild(BikeCard);
        }
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });
// ----------------------- DELETE BIKE FROM USERS SAVED BIKES --------------------------
document.getElementById('SavedBikesContainer').addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('delete-button')) {
        const SelectedBikeCard = event.target.closest('.bike-card');
        if (SelectedBikeCard) {
            const bikeId = event.target.dataset.bikeId; //get the bikes id thats being deleted from the card

            const DeleteData = {
                BikeID: bikeId
            };

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
document
    .getElementById('SavedBikesContainer')
    .addEventListener('click', async (event) => {

        if (!event.target.classList.contains('add-to-basket-button')) return;

        const card = event.target.closest('.bike-card');
        if (!card) return;

        const bike = JSON.parse(card.dataset.bike);

        // Load correct parts file
        const fileMap = {
            1: "bike-parts/enduro_parts.json",
            2: "bike-parts/dh_parts.json",
            3: "bike-parts/dj_parts.json"
        };

        const { parts } = await LoadParts(fileMap[bike.BikeType]);

        const find = (id) => parts.find(p => p.Id === id) || {};

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

        const total = CalculateBikeTotal(ResolvedParts);

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

        fetch("https://localhost:7165/api/basket/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(BasketData)
        })
            .then(res => res.ok
                ? alert("Bike added to basket!")
                : alert("Failed to add bike")
            )
            .catch(err => console.error("Basket error:", err));
    });

// ----------------------- ADD TO BASKET --------------------------
document
    .getElementById('SavedBikesContainer')
    .addEventListener('click', (event) => {

        if (!event.target.classList.contains('edit-button')) return;

        const card = event.target.closest('.bike-card');
        if (!card) return;

        const bike = JSON.parse(card.dataset.bike);

        //save bike config for builder
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

        const typeMap = { 1: "enduro", 2: "dh", 3: "dj" };

        window.location.href =
            `builder.html?bike=${typeMap[bike.BikeType]}&fromsave=true`;
    });
