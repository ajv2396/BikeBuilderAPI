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
        const LoggedInAccountID = data.AccountId;
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

//---------------Get details from user_saves.json-----------
fetch('user_saves.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const container = document.getElementById('SavedBikesContainer');

        //if its an object
        if (!Array.isArray(data)) {
            console.warn("Data is not an array");
            return;
        }


        LoadParts();



        //-------PUT INTO HTML CARDS------
        data.forEach((bike, index) => {
            let BikeType;
            //-------GET IMAGE PATHS AND VARIABLE NAMES------------
            switch (bike.BikeType) {
                case 1:
                    BikeType = "Enduro";
                    break;
                case 2:
                    BikeType = "Downhill";
                    break;
                case 3:
                    BikeType = "Dirt Jumper";
                    break;
                default:
                    BikeType = "Unknown";
            }

            //-------REST OF ADDING TO HTML---------------
            const BikeCard = document.createElement('div');
            BikeCard.classList.add('bike-card');

            //Get Todays date
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const TodaysDate = `${year}-${month}-${day}`;

            //trim the length of the bike saved at as it shows time in json/database
            let BikeSaveDate = bike.SavedAt.substring(0, 10);

            //If the bike was created today, then show time, if its created another day then show date
            if (TodaysDate == BikeSaveDate) {
                BikeSaveDate = bike.SavedAt.substring(11, 16);
            } else {
                BikeSaveDate = bike.SavedAt.substring(0, 10);
            }

            BikeCard.innerHTML = `
                <h3>Bike #${index + 1}</h3>
                <br/>
                <div id="bike-display">
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
                <div class="bike-display-data">
                    <p><strong>Type:</strong> ${BikeType}</p>
                    <p><strong>Frame:</strong> ${bike.Frame}</p>
                    <p><strong>Fork:</strong> ${bike.Fork}</p>
                    <p><strong>Shock:</strong> ${bike.Shock}</p>
                    <p><strong>Wheels:</strong> ${bike.Wheels}</p>
                    <p><strong>Tyres:</strong> ${bike.Tyres}</p>
                    <p><strong>Drivetrain:</strong> ${bike.Drivetrain}</p>
                    <p><strong>Brakes:</strong> ${bike.Brakes}</p>
                    <p><strong>Seatpost:</strong> ${bike.Seatpost}</p>
                    <p><strong>Saddle:</strong> ${bike.Saddle}</p>
                    <p><strong>Bars:</strong> ${bike.Bars}</p>
                    <p><strong>Stem:</strong> ${bike.Stem}</p>
                    <p><strong>Pedals:</strong> ${bike.Pedals}</p>
                    <p><strong>Bike ID:</strong> ${bike.Id}</p>
                    <p><strong>Created At:</strong> ${BikeSaveDate}</p>
                    <br>
                    <div class="delete-container">
                        <button class="delete-button" data-bike-id="${bike.Id}">Delete</button>
                    </div>
                </div>
                `;

            BikeCard.querySelector('.frame-img').src = `images/${bike.BikeType}/frames/${bike.Frame}.png`;
            BikeCard.querySelector('.shock-img').src = `images/${bike.BikeType}/frame-specific/shocks/${bike.Shock}_${bike.Frame}.png`;
            BikeCard.querySelector('.fork-img').src = `images/${bike.BikeType}/forks/${bike.Fork}.png`;
            BikeCard.querySelector('.wheels-img').src = `images/${bike.BikeType}/wheels/${bike.Wheels}.png`;
            BikeCard.querySelector('.tyres-img').src = `images/${bike.BikeType}/tyres/${bike.Tyres}.png`;
            BikeCard.querySelector('.drivetrain-img').src = `images/${bike.BikeType}/drivetrains/${bike.Drivetrain}.png`;
            BikeCard.querySelector('.brakes-img').src = `images/${bike.BikeType}/frame-specific/brakes/${bike.Brakes}_${bike.Frame}.png`;
            BikeCard.querySelector('.seatpost-img').src = `images/${bike.BikeType}/frame-specific/seatposts/${bike.Seatpost}-${bike.Frame}.png`;
            BikeCard.querySelector('.saddle-img').src = `images/${bike.BikeType}/frame-specific/saddles/${bike.Saddle}_${bike.Frame}.png`;
            BikeCard.querySelector('.bars-img').src = `images/${bike.BikeType}/bars/${bike.Bars}.png`;
            BikeCard.querySelector('.stem-img').src = `images/${bike.BikeType}/stems/${bike.Stem}.png`;
            BikeCard.querySelector('.pedals-img').src = `images/${bike.BikeType}/pedals/${bike.Pedals}.png`;
            BikeCard.querySelector('.drivetrain-rear-img').src = `images/${bike.BikeType}/drivetrains/${bike.Drivetrain}-rear.png`;

            container.appendChild(BikeCard);
        })
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    })

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