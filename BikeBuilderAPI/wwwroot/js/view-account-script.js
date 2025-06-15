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



//Get details from user_saves.json
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

        data.forEach((bike, index) => {
            const BikeCard = document.createElement('div');
            BikeCard.classList.add('bike-card');
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
                    <p><strong>Type:</strong> ${bike.BikeType}</p>
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