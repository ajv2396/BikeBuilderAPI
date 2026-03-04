/*
    index-script.js

    This script controls the Home Page of the Bike Builder system.
    It handles two separate areas of functionality:

    1. Navigation bar session management:
       - Reads the current user session to determine login state
       - Shows or hides nav buttons (login, signup, view account, logout, basket)
         depending on whether a user is logged in
       - Handles the logout button (clears session and saved builds server-side)
       - Handles the view account button (refreshes user saves before navigating)

    2. Home page content:
       - Loads all saved bike builds from all-saves.json and renders them as
         layered image previews to fill the animated background carousel
       - Clones bike cards to ensure the background always meets a minimum density
       - Fades the background in once all images have loaded
       - Controls the bike type selection buttons, animating a cycling image
         preview when the user hovers over each button
*/


document.addEventListener("DOMContentLoaded", () => {

    // Handle logout button click: clear session and saved builds on the server, then reload home page
    document.getElementById("log-out-button").addEventListener("click", async () => {
        try {
            await fetch("/api/logout/clear-session", { method: "POST" });   // Clear user_session.json
            await fetch("/api/logout/clear-saves", { method: "POST" });     // Clear user_saves.json
            window.location.href = "index.html"; //refresh to load new buttons
        } catch (error) {
            console.error("logout failed", error);
        }
    });

    // Handle view account button click: refresh the user's saved builds before navigating to account page
    document.getElementById("view-account-button").addEventListener("click", async () => {
        try {
            await fetch("/api/logout/refresh-user-saves", { method: "POST" }); // Re-export current user's saves to JSON
            window.location.href = "view-account.html"; //go to view account page
        } catch (error) {
            console.error("refresh failed", error);
        }
    });
});


// Fetch the current session file to determine login state and update the nav bar accordingly
fetch('user_session.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);

        // If no user is logged in (all fields null), hide the view account button and stop
        if (data.FirstName == null && data.LastName == null && data.Email == null) {
            document.querySelector(".view-account-button").style.display = "none";
            return;
        }

        // Build the display name and account ID string for the logged-in user
        const LoggedInName = data.FirstName + " " + data.LastName;
        const LoggedInAccountID = data.AccountId;

        // Update the nav bar label with the logged-in user's name and account ID
        document.getElementById('LoggedInName').textContent = "";
        document.getElementById('LoggedInName').textContent = "Logged in as: " + LoggedInName + " | ID: " + LoggedInAccountID;

        const Email = data.Email;

        // Show account-related nav buttons and hide the login/signup buttons
        document.querySelector(".view-account-button").style.display = "flex";
        document.querySelector(".log-out-button").style.display = "flex";
        document.querySelector(".basket").style.display = "flex";
        document.querySelector(".login-button").style.display = "none";
        document.querySelector(".signup-button").style.display = "none";
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    })


//---------------------------------------BELOW FOR LOADING CAROSEL/BIKE PARTS-----------------------------------------

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

//--------------- Get details from all-saves.json-----------

/*
    Loads all saved bike builds from all-saves.json and renders each one
    as a layered bike image preview card in the background carousel.
    Part files are cached per bike type to avoid redundant fetches.
    If fewer than MIN_BIKES cards exist, clones are added to fill out the background.
    Once all images are loaded, the background fades in.
*/
fetch('all-saves.json')
    .then(async (response) => {
        if (!response.ok) throw new Error('Response was not ok');
        return response.json();
    })
    .then(async (data) => {
        const container = document.getElementById('SavedBikesContainer');

        // Ensure the saved bikes data is an array before proceeding
        if (!Array.isArray(data)) {
            console.warn("Data is not an array");
            return;
        }

        const PartsCache = {};  // Cache loaded parts files per bike type to avoid redundant fetches

        for (const [index, bike] of data.entries()) {

            let BikeType;       // Human-readable bike type label
            let BikeImgPath;    // Image folder name for this bike type

            // Convert numeric bike type ID to readable label and folder path
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

            // Skip this bike if no valid parts file path was found
            if (!FilePath) {
                console.warn(`Unknown bike type ${bike.BikeType}`);
                continue;
            }

            // Load and cache the parts file for this bike type if not already loaded
            if (!PartsCache[bike.BikeType]) {
                PartsCache[bike.BikeType] = await LoadParts(FilePath);
            }
            const parts = PartsCache[bike.BikeType].parts;

            // Helper to find a part by its ID, returning an empty object if not found
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

            // Create the card container element for this bike
            const BikeCard = document.createElement('div');
            BikeCard.classList.add('bike-card');

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

            // Inject the layered image HTML into the bike card
            BikeCard.innerHTML = `
            <div class="bike-display">
               ${BikeDisplayHTML}
            </div>
          `;

            // Assign image source paths to each layered image element
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

            // Add the completed card to the background container
            container.appendChild(BikeCard);
        }

        // ---------- FILL BACKGROUND WITH REPEATED BIKES ----------
        const MIN_BIKES = 30; // Minimum number of bike cards needed to fill the background

        // Take a snapshot of the originally loaded cards before cloning begins
        const cards = Array.from(container.children);
        let i = 0;

        // Clone existing cards in a round-robin loop until the minimum density is reached
        while (container.children.length < MIN_BIKES && cards.length > 0) {
            const clone = cards[i % cards.length].cloneNode(true);
            container.appendChild(clone);
            i++;
        }

        //FADING FOR BACKGROUND LOAD
        // Fade in the background once all bike preview images have finished loading
        const bg = document.querySelector('.bike-background');
        const images = bg.querySelectorAll('img');

        let loaded = 0;

        // Count each image as it finishes loading
        images.forEach(img => {
            if (img.complete) {
                // Image was already cached and loaded instantly
                loaded++;
            } else {
                img.addEventListener('load', () => {
                    loaded++;
                    // Once every image is loaded, apply the fade-in CSS class
                    if (loaded === images.length) {
                        bg.classList.add('loaded');
                    }
                });
            }
        });

        // Handle the case where all images were already cached and loaded synchronously
        if (loaded === images.length) {
            bg.classList.add('loaded');
        }

    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });


// ----------------- BUTTON IMAGES ------------------------

/*
    Defines preview image sets for each bike type selection button.
    Each bike type has 4 images that cycle when the user hovers over the button.
*/
const previewData = {
    enduro: [
        "images/HomePage/Enduro/1.png",
        "images/HomePage/Enduro/2.png",
        "images/HomePage/Enduro/3.png",
        "images/HomePage/Enduro/4.png"
    ],
    dh: [
        "images/HomePage/DH/1.png",
        "images/HomePage/DH/2.png",
        "images/HomePage/DH/3.png",
        "images/HomePage/DH/4.png"
    ],
    dj: [
        "images/HomePage/DJ/1.png",
        "images/HomePage/DJ/2.png",
        "images/HomePage/DJ/3.png",
        "images/HomePage/DJ/4.png"
    ]
};

// Attach hover animation behaviour to each bike type preview button
document.querySelectorAll(".preview-button").forEach(button => {
    const bikeType = button.dataset.bike;   // Read which bike type this button represents
    const images = previewData[bikeType];
    if (!images) return;

    const preview = button.querySelector(".bike-preview");
    const imgs = preview.querySelectorAll(".preview-img"); // Two overlapping image elements used for crossfade

    let index = 0;      // Index of the currently displayed image in the images array
    let timer = null;   // Interval timer reference, used to stop animation on mouse leave
    let front = 0;      // Tracks which of the two img elements is currently visible (0 or 1)

    // Start cycling through preview images when the user hovers over the button
    button.addEventListener("mouseenter", () => {
        timer = setInterval(() => {
            const next = (index + 1) % images.length;  // Next image index, wrapping around
            const back = 1 - front;                     // The hidden img element (the one not currently shown)

            // Load the next image into the hidden element and crossfade to it
            imgs[back].src = images[next];
            imgs[back].classList.add("active");
            imgs[front].classList.remove("active");

            // Swap which element is considered "front"
            front = back;
            index = next;
        }, 400);    // Cycle every 400ms
    });

    // Stop cycling and reset to the first image when the user moves their cursor away
    button.addEventListener("mouseleave", () => {
        clearInterval(timer);
        timer = null;

        // Reset to first image
        imgs[0].src = images[0];
        imgs[0].classList.add("active");
        imgs[1].classList.remove("active");
        front = 0;
        index = 0;
    });
});