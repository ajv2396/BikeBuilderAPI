document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("log-out-button").addEventListener("click", async () => {
        try {
            await fetch("/api/logout/clear-session", { method: "POST" });
            await fetch("/api/logout/clear-saves", { method: "POST" });
            window.location.href = "index.html"; //refresh to load new buttons
        } catch (error) {
            console.error("logout failed", error);
        }
    });
    document.getElementById("view-account-button").addEventListener("click", async () => {
        try {
            await fetch("/api/logout/refresh-user-saves", { method: "POST" });
            window.location.href = "view-account.html"; //go to view account page
        } catch (error) {
            console.error("refresh failed", error);
        }
    });
});

//Get details from user_session
fetch('user_session.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);

        //If noone is logged in
        if (data.FirstName == null && data.LastName == null && data.Email == null) {
            document.querySelector(".view-account-button").style.display = "none";
            return;
        }

        const LoggedInName = data.FirstName + " " + data.LastName;
        const LoggedInAccountID = data.AccountId;

        document.getElementById('LoggedInName').textContent = "Logged in as: " + LoggedInName + " | ID: " + LoggedInAccountID;

        const Email = data.Email;

        document.querySelector(".view-account-button").style.display = "flex";
        document.querySelector(".log-out-button").style.display = "flex";
        document.querySelector(".login-button").style.display = "none";
        document.querySelector(".signup-button").style.display = "none";
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    })

//---------------------------------------BELOW FOR LOADING CAROSEL/BIKE PARTS-----------------------------------------

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
//--------------- Get details from all-saves.json-----------
fetch('all-saves.json')
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
                ShockPart.Name = "No shock"
            }

            const FrameSelected = FramePart.ImagePath.slice(0, -4);

            const BikeCard = document.createElement('div');
            BikeCard.classList.add('bike-card');

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

            if (bike.BikeType !== 3) {
                BikeCard.innerHTML = `
                            <div class="bike-display">
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
                            </div>
                            `;
            } else {
                BikeCard.innerHTML = `
                            <div class="bike-display">
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
                            </div>
                            `;
            }

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

        // ---------- FILL BACKGROUND WITH REPEATED BIKES ----------
        const MIN_BIKES = 30; // more/less density

        const cards = Array.from(container.children);
        let i = 0;

        while (container.children.length < MIN_BIKES && cards.length > 0) {
            const clone = cards[i % cards.length].cloneNode(true);
            container.appendChild(clone);
            i++;
        }

        //FADING FOR BACKGROUND LOAD
        const bg = document.querySelector('.bike-background');
        const images = bg.querySelectorAll('img');

        let loaded = 0;

        images.forEach(img => {
            if (img.complete) {
                loaded++;
            } else {
                img.addEventListener('load', () => {
                    loaded++;
                    if (loaded === images.length) {
                        bg.classList.add('loaded');
                    }
                });
            }
        });

        if (loaded === images.length) {
            bg.classList.add('loaded');
        }

    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });



