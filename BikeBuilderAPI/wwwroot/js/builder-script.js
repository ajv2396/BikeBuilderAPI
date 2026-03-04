/*
    builder-script.js

    This script controls the main Bike Builder page. It handles loading bike
    parts from JSON, rendering the part selection UI, managing the layered bike
    image preview, tracking selected parts, calculating price and weight totals,
    saving and loading builds (including from saved accounts and basket redirects),
    adding bikes to the basket, and navigating between part categories.
*/

let LoggedInAccountID = null;   // Stores the account ID of the currently logged-in user
let total;                       // Stores the current total price of the selected build
const BikeTypeMap = { enduro: 1, dh: 2, dj: 3 };   // Maps bike type string keys to numeric IDs used by the backend


//------------------DETECT IF USER COMES FROM EDIT MODE--------------

// Read query string parameters from the current page URL
const qs = new URLSearchParams(window.location.search);

// Check if the user arrived via the "Edit" button on a saved bike
const isFromSave = qs.get("fromsave") === "true";

let savedBike = null;   // Will hold the saved bike data if editing a previously saved build

// If editing a saved build, retrieve it from localStorage
if (isFromSave) {
    const raw = localStorage.getItem("editBike");
    if (raw) {
        savedBike = JSON.parse(raw);
    }
}

//---------------DETECT IF USER COMES FROM BASKET-------------------

// Check if the user returned to the builder from the basket page
const isFromBasket = qs.get("frombasket") === "true";

let RedirectBike = null;    // Will hold the bike data to restore if returning from basket

// If returning from basket, retrieve the previously stored bike state from localStorage
if (isFromBasket) {
    const raw = localStorage.getItem("RedirectBike");
    if (raw) {
        RedirectBike = JSON.parse(raw);
    }
}

// Maps numeric bike type IDs back to their string keys (reverse of BikeTypeMap)
const BikeTypeIdToKey = {
    1: "enduro",
    2: "dh",
    3: "dj"
};


// -------------------------- LOAD SESSION --------------------------

// Fetch the current user session to get the logged-in account ID
fetch("user_session.json")
    .then((response) => {
        if (!response.ok) throw new Error("Response was not ok");
        return response.json();
    })
    .then((data) => {
        console.log("Session:", data);
        // Store the account ID so it can be used for saving bikes and adding to basket
        LoggedInAccountID = data.AccountId;
    })
    .catch((error) => console.error("Error fetching session:", error));

//--------------------------- LOAD REVIEWS -----------------------------
let AllReviews = [];    // Stores all reviews loaded from the reviews JSON file

// Fetches all reviews from the server and stores them in AllReviews
async function LoadReviews() {
    try {
        const resp = await fetch("reviews/reviews.json");
        if (!resp.ok) throw new Error("Failed to load reviews");
        AllReviews = await resp.json();

    } catch (err) {
        console.error("Error loading reviews:", err);
    }
}

// Generates an HTML string of star icons based on a numeric rating (0–5)
// Supports full stars, half stars, and empty stars
function RenderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars += `<i class="fas fa-star"></i>`; //full star
        } else if (rating >= i - 0.5) {
            stars += `<i class="fas fa-star-half-alt"></i>`; //half star 
        } else {
            stars += `<i class="far fa-star"></i>`; //empty star
        }
    }
    return stars;
}

// -------------------------- BIKE TYPE --------------------------

/*
    Determines the active bike type string (e.g. "enduro", "dh", "dj").
    Priority order:
        1. RedirectBike (returning from basket — preserves previously selected type)
        2. URL query string parameter "bike"
        3. localStorage value "bikeType"
        4. Default: "enduro"
*/
function GetBikeType() {
    if (RedirectBike?.BikeType) {
        return BikeTypeIdToKey[RedirectBike.BikeType] || "enduro";
    }

    const qs = new URLSearchParams(window.location.search);
    const urlBike = qs.get("bike");
    if (urlBike) return urlBike.toLowerCase();

    const storedBike = localStorage.getItem("bikeType");
    if (storedBike) return storedBike.toLowerCase();

    return "enduro";
}


const BikeType = GetBikeType();                         // Active bike type string
const BikeTypeIdentification = BikeTypeMap[BikeType] || 1;  // Numeric ID for the active bike type

// Maps each bike type string to its corresponding parts JSON file
const fileMap = {
    enduro: "bike-parts/enduro_parts.json",
    dh: "bike-parts/dh_parts.json",
    dj: "bike-parts/dj_parts.json",
};
const PartFile = fileMap[BikeType];     // The JSON file to load for the current bike type

// ---------- CHANGE ORDER OF DISPLAY FOR DIFFERENT TYPES ---------

/*
    Defines the z-index layering order for bike part images per bike type.
    Images are appended to the bike display in this order so that parts
    visually overlap each other correctly in the preview.
*/
const bikeLayerOrders = {
    // ENDURO
    1: [
        "brakes",
        "tyres",
        "shock",
        "wheels",
        "fork",
        "saddle",
        "seatpost",
        "drivetrain-rear",
        "frame",
        "stem",
        "drivetrain",
        "bars",
        "pedals"
    ],

    // DOWNHILL (forks in front of frame)
    2: [
        "brakes",
        "tyres",
        "shock",
        "wheels",
        "saddle",
        "seatpost",
        "drivetrain-rear",
        "stem",
        "bars",
        "frame",
        "fork",
        "drivetrain",
        "pedals"
    ],

    // DIRT JUMPER (no shock)
    3: [
        "brakes",
        "tyres",
        "wheels",
        "fork",
        "seatpost",
        "saddle",
        "drivetrain-rear",
        "frame",
        "stem",
        "drivetrain",
        "bars",
        "pedals"
    ]
};

// Clear the bike display container and build image elements in the correct layer order
const bikeDisplay = document.getElementById("bike-display");
bikeDisplay.innerHTML = "";

// Get the layer order for the current bike type, defaulting to Enduro if not found
const layerOrder = bikeLayerOrders[BikeTypeIdentification] || bikeLayerOrders[1];

// Create one <img> element per layer and append it to the bike display
layerOrder.forEach(part => {
    const img = document.createElement("img");
    img.id = `${part}-img`;     // ID used later by SelectPart to update the correct image
    bikeDisplay.appendChild(img);
});


// -------------------------- LOAD PARTS --------------------------

/*
    Fetches a bike parts JSON file and returns:
        - parts: the full flat list of all parts
        - byType: parts grouped into a dictionary by their PartType category
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

// ------------------LOAD PARTS FROM SAVED BUILD------------------

/*
    Selects all parts from a previously saved bike build.
    Frame is selected first so that frame-specific parts (shock, brakes, etc.)
    can correctly calculate their image paths using the selected frame.
*/
function LoadSavedBuild() {
    if (!savedBike) return;

    // Map each part type to the saved part ID
    const idMap = {
        frame: savedBike.Frame,
        shock: savedBike.Shock,
        fork: savedBike.Fork,
        wheels: savedBike.Wheels,
        tyres: savedBike.Tyres,
        drivetrain: savedBike.Drivetrain,
        brakes: savedBike.Brakes,
        seatpost: savedBike.Seatpost,
        saddle: savedBike.Saddle,
        bars: savedBike.Bars,
        stem: savedBike.Stem,
        pedals: savedBike.Pedals
    };

    // Select frame first so FrameSelected is set before frame-specific parts are loaded
    if (idMap.frame) {
        const frame = allParts.find(p => p.Id === idMap.frame);
        if (frame) SelectPart(frame);
    }

    // Select remaining parts (skipping frame as it has already been selected)
    Object.entries(idMap).forEach(([type, id]) => {
        if (!id || type === "frame") return;
        const part = allParts.find(p => p.Id === id);
        if (part) SelectPart(part);
    });

    //remove the edit bike from local storage
    localStorage.removeItem("editBike");
}

// ------------------LOAD PARTS FROM REDIRECT BUILD------------------

/*
    Restores a bike build when the user returns from the basket page.
    Uses the RedirectBike stored in localStorage before navigating to basket.
    Frame is selected first for the same reason as LoadSavedBuild.
*/
function LoadRedirectBuild() {
    if (!RedirectBike) return;

    // Map each part type to the redirect bike's stored part ID
    const RedirectIDMap = {
        frame: RedirectBike.Frame,
        shock: RedirectBike.Shock,
        fork: RedirectBike.Fork,
        wheels: RedirectBike.Wheels,
        tyres: RedirectBike.Tyres,
        drivetrain: RedirectBike.Drivetrain,
        brakes: RedirectBike.Brakes,
        seatpost: RedirectBike.Seatpost,
        saddle: RedirectBike.Saddle,
        bars: RedirectBike.Bars,
        stem: RedirectBike.Stem,
        pedals: RedirectBike.Pedals
    };

    // Select frame first so FrameSelected is set before frame-specific parts are loaded
    if (RedirectIDMap.frame) {
        const frame = allParts.find(p => p.Id === RedirectIDMap.frame);
        if (frame) SelectPart(frame);
    }

    // Select remaining parts (skipping frame as it has already been selected)
    Object.entries(RedirectIDMap).forEach(([type, id]) => {
        if (!id || type === "frame") return;
        const part = allParts.find(p => p.Id === id);
        if (part) SelectPart(part);
    });
}


// -------------------------- UI ORDER --------------------------

// Defines the order in which part categories are displayed as steps in the builder UI
const desiredOrder = [
    "frame",
    "shock",
    "fork",
    "wheels",
    "tyres",
    "drivetrain",
    "brakes",
    "pedals",
    "stem",
    "bars",
    "seatpost",
    "saddle",
];

// Parts in this set require a frame-specific image path (their images depend on the selected frame)
const frameSpecificTypes = new Set(["saddle", "seatpost", "shock", "brakes"]);


// -------------------------- RENDER PARTS --------------------------

/*
    Builds and inserts the selection UI for one part category (e.g. "frame", "fork").
    For each part it displays a thumbnail, name, price, weight, description,
    average star rating, review count, and a More Info button.
    The section is hidden by default and shown only when it is the active step.
*/
function RenderPartSection(partType, items) {
    const container = document.createElement("div");
    container.id = `step-${partType}`;
    container.className = "bike-part-select";
    container.style.display = "none";   // Hidden until this step is navigated to

    // Create and add the section heading label
    const label = document.createElement("label");
    label.textContent =
        "Choose " + partType[0].toUpperCase() + partType.slice(1) + ":";
    container.appendChild(label);

    const optionsDiv = document.createElement("div");
    optionsDiv.className = `${partType}-options`;

    items.forEach((item) => {
        // Filter all reviews down to only those for this specific part
        const PartReviews = AllReviews.filter(r => r.BikePartID === item.Id);

        let NumberOfReviews = "0";
        let avg = 0;
        let StarsHtml = "";
        NumberOfReviews = PartReviews.length;

        // Calculate average rating if there are any reviews
        if (PartReviews.length > 0) {
            avg = PartReviews.reduce((a, r) => a + r.Rating, 0) / PartReviews.length;
        }

        // Generate star icon HTML based on the average rating
        StarsHtml = `<span class="stars">${RenderStars(avg)}</span>`;

        // Create the clickable option element for this part
        const opt = document.createElement("div");
        opt.className = `part-option ${partType}-option`;
        opt.dataset.id = item.Id;
        opt.dataset.image = item.ImagePath;
        opt.dataset.BikeTypeId = item.BikeTypeId;

        // Flag frame-specific parts so SelectPart knows to use frame-specific image paths
        opt.dataset.framespecific = frameSpecificTypes.has(partType) ? "1" : "0";

        opt.innerHTML = `
            <img src="${item.ThumbnailPath}" alt="${item.Name}">
            <p class="part-name">${item.Name}</p>
            <p class="part-meta">
                &pound;${item.Price} | ${item.Weight}g
            </p>
            <p class="part-description">
                ${item.Description}
            </p>
            <div class="part-rating">
                ${StarsHtml}
                <span class="review-count">(${NumberOfReviews})</span>
            </div>
            <p class="part-more-button">
                <button type="button">More Info</button>
            </p>
        `;

        // Attach click handler to the More Info button to open part details in a new tab
        const MoreInfoButton = opt.querySelector("button");
        MoreInfoButton.addEventListener("click", () => {
            const url = `part-details.html?id=${encodeURIComponent(item.Id)}&TypeId=${encodeURIComponent(item.BikeTypeId)}`;
            window.open(url, "_blank"); // _blank for opening in new tab
        });

        optionsDiv.appendChild(opt);
    });

    container.appendChild(optionsDiv);

    // Insert the section into the selector bar, before the next button
    const selectorBar = document.querySelectorAll(".part-selector-bar")[1];
    const nextButton = selectorBar.querySelector(".next-button");
    selectorBar.insertBefore(container, nextButton);
}

// -------------------------- UPDATE PRICING --------------------------

// Recalculates and displays the total price and weight from all currently selected parts
function UpdateTotalPrice() {
    total = 0;
    let weight = 0;
    Object.values(selectedParts).forEach(part => {
        if (part.Price) total += part.Price;
        if (part.Weight) weight += part.Weight;
    });

    const totalDisplay = document.getElementById("total-price");
    totalDisplay.innerHTML =
        "Total: &pound;" + total + "<br /><br /> Weight: " + weight + "g";
}


// -------------------------- IMAGE MAPPING --------------------------

// Maps each part type string to the corresponding image element ID in the bike display
const imageMap = {
    frame: "frame-img",
    shock: "shock-img",
    fork: "fork-img",
    wheels: "wheels-img",
    tyres: "tyres-img",
    drivetrain: "drivetrain-img",
    "drivetrain-rear": "drivetrain-rear-img",
    brakes: "brakes-img",
    pedals: "pedals-img",
    stem: "stem-img",
    bars: "bars-img",
    seatpost: "seatpost-img",
    saddle: "saddle-img",
};

let FrameSelected = "";     // Stores the current frame's image filename (without extension) for use in frame-specific image paths
const selectedParts = {};   // Dictionary of currently selected parts, keyed by part type
let allParts = [];          // Full flat list of all parts for the current bike type
let partsByType = {};       // Parts grouped by PartType category
let BuildSteps = [];        // Ordered list of part type steps present for this bike type
let currentStep = 0;        // Index of the currently displayed build step

// -------------------------- SELECT PART --------------------------

// Maps each part type to its image folder path within the bike type's image directory
const folderMap = {
    frame: "frames",
    shock: "frame-specific/shocks",
    fork: "forks",
    wheels: "wheels",
    tyres: "tyres",
    drivetrain: "drivetrains",
    brakes: "frame-specific/brakes",
    pedals: "pedals",
    stem: "stems",
    bars: "bars",
    seatpost: "frame-specific/seatposts",
    saddle: "frame-specific/saddles",
};

/*
    Handles selecting a part:
        - Builds the correct image path (handling frame-specific parts separately)
        - Updates the corresponding image element in the bike preview
        - Stores the selected part in selectedParts
        - If the frame changes, updates all currently selected frame-specific part images
        - Recalculates the total price and weight
*/
function SelectPart(part) {
    if (!part || !part.PartType) return;

    const imgId = imageMap[part.PartType];
    if (!imgId) return;

    // Base image path uses a capitalised version of the bike type string (e.g. "Enduro", "Dh")
    const base = `images/${BikeType[0].toUpperCase() + BikeType.slice(1)}`;
    const folder = folderMap[part.PartType];
    if (!folder) return;

    // Builds the full image src path, appending frame name for frame-specific parts
    const getSrc = (imageName) => {
        if (!imageName) return null;

        if (frameSpecificTypes.has(part.PartType)) {
            const sep = part.Separator || "_";
            // Cannot render frame-specific image without knowing which frame is selected
            if (!FrameSelected) {
                console.warn("Frame not yet selected, cannot render frame-specific part:", part.PartType);
                return null;
            }
            return `${base}/${folder}/${imageName}${sep}${FrameSelected}.png`;
        } else {
            return `${base}/${folder}/${imageName}`;
        }
    };

    // --------- Special case: drivetrain ---------
    // Drivetrain requires two images: a front-facing image and a rear-facing image
    if (part.PartType === "drivetrain") {
        if (!part.ImagePath) {
            console.warn("Drivetrain part has no ImagePath:", part);
            return;
        }

        const frontId = imageMap["drivetrain"];
        const rearId = imageMap["drivetrain-rear"];

        // Front image uses the base ImagePath with .png extension
        const frontSrc = getSrc(part.ImagePath + ".png");
        // Rear image uses the same base ImagePath with a -rear suffix
        const rearSrc = getSrc(part.ImagePath + "-rear.png");

        if (frontId && frontSrc) document.getElementById(frontId).src = frontSrc;
        if (rearId && rearSrc) document.getElementById(rearId).src = rearSrc;

    } else {
        // --------- Normal parts ---------
        if (!part.ImagePath) {
            console.warn("Part has no ImagePath:", part);
            return;
        }
        const src = getSrc(part.ImagePath);
        if (imgId && src) document.getElementById(imgId).src = src;
    }

    // Store selected part in the dictionary, overwriting any previously selected part of this type
    selectedParts[part.PartType] = part;
    UpdateTotalPrice();

    // --- Update frame-specific parts if frame changes ---
    // When a new frame is selected, re-render all currently selected frame-specific parts
    // so their images correctly match the new frame geometry
    if (part.PartType === "frame") {
        FrameSelected = part.ImagePath.replace(".png", "");

        Object.entries(selectedParts).forEach(([type, p]) => {
            if (frameSpecificTypes.has(type) && p.ImagePath) {
                const id = imageMap[type];
                if (!id) return;
                const sep = p.Separator || "_";
                const folderForType = folderMap[type];
                const src = `${base}/${folderForType}/${p.ImagePath}${sep}${FrameSelected}.png`;
                const imgEl = document.getElementById(id);
                if (imgEl) imgEl.src = src;
            }
        });
    }
}

// -------------------------- STEP NAVIGATION --------------------------

/*
    Shows the build step at the given index and hides all others.
    Also manages the visibility and interactivity of the previous/next buttons:
        - Prev button is hidden on the first step
        - Next button is hidden on the last step
*/
function ShowStep(index) {
    BuildSteps.forEach((step, i) => {
        const el = document.getElementById(`step-${step}`);
        el.style.display = i === index ? "block" : "none";
    });

    currentStep = index;

    const prevBtn = document.querySelector(".prev-button");
    const nextBtn = document.querySelector(".next-button");

    // Hide prev button on first step so user cannot navigate backwards past the start
    if (currentStep === 0) {
        prevBtn.style.opacity = "0";
        prevBtn.style.pointerEvents = "none";
    } else {
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
    }

    // Hide next button on last step so user cannot navigate past the end
    if (currentStep === BuildSteps.length - 1) {
        nextBtn.style.opacity = "0";
        nextBtn.style.pointerEvents = "none";
    } else {
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
    }
}


// Navigate to the previous build step when the prev button is clicked
document.querySelector(".prev-button").addEventListener("click", () => {
    if (currentStep > 0) ShowStep(currentStep - 1);
});

// Navigate to the next build step when the next button is clicked
document.querySelector(".next-button").addEventListener("click", () => {
    if (currentStep < BuildSteps.length - 1) ShowStep(currentStep + 1);
});

// -------------------------- EVENT HANDLER --------------------------

// Handles click events on part option elements within the selector bar
document.querySelectorAll(".part-selector-bar")[1].addEventListener("click", (e) => {
    const opt = e.target.closest(".part-option");
    if (!opt) return;

    const id = opt.dataset.id;
    const part = allParts.find((p) => String(p.Id) === id);
    if (part) {
        // Remove 'selected' highlight from all options of this part type
        document.querySelectorAll(`.${part.PartType}-option`).forEach(el => el.classList.remove('selected'));
        // Highlight the clicked option as selected
        opt.classList.add('selected');

        SelectPart(part);
    }
});

// ---------------- BIKE SIZE CONTROLS ----------------
let bikeImageSize = 800; //default size
const SIZE_STEP = 50;   // Amount to increase or decrease image width per click
const MIN_SIZE = 250;   // Minimum allowed image width in pixels
const MAX_SIZE = 1050;  // Maximum allowed image width in pixels

// Applies the current bikeImageSize to all bike display images
function UpdateBikeSize() {
    document
        .querySelectorAll("#bike-display img")
        .forEach(img => {
            img.style.width = bikeImageSize + "px";
        });
}

// Increase image size when zoom in button is clicked, up to MAX_SIZE
document.getElementById("zoom-in").addEventListener("click", () => {
    if (bikeImageSize < MAX_SIZE) {
        bikeImageSize += SIZE_STEP;
        UpdateBikeSize();
    }
});

// Decrease image size when zoom out button is clicked, down to MIN_SIZE
document.getElementById("zoom-out").addEventListener("click", () => {
    if (bikeImageSize > MIN_SIZE) {
        bikeImageSize -= SIZE_STEP;
        UpdateBikeSize();
    }
});


// -------------------------- BASKET REDIRECT --------------------

// Navigate to the basket page when the basket button is clicked
document.querySelector('.basket').addEventListener('click', () => {
    window.location.href = 'basket.html';
});

// ----------------------CALCULATE TOTAL FOR BASKET -------------------

// Returns the sum of prices of all currently selected parts
function CalculateTotal() {
    let sum = 0;
    Object.values(selectedParts).forEach(part => {
        if (part.Price) sum += part.Price;
    });
    return sum;
}


// ----------------------- ADD TO BASKET --------------------------

// Handles adding the current build to the basket when the button is clicked
document.getElementById("add-to-basket").addEventListener("click", () => {

    // Prevent adding to basket if the user is not logged in
    if (LoggedInAccountID == null) {
        alert("You are not logged in. Login or signup.");
        return;
    }

    // Check that all required part types for this bike have been selected
    for (const type of desiredOrder) {
        if (partsByType[type] && !selectedParts[type]) {
            alert(`Not all parts selected. Missing: ${type}`);
            return;
        }
    }

    // Build the basket data object containing the account ID, all selected part IDs, and the calculated total
    const BasketData = {
        AccountId: LoggedInAccountID,
        Bike: {
            BikeType: BikeTypeMap[BikeType] || 1,
            Frame: selectedParts.frame?.Id || 0,
            Shock: selectedParts.shock?.Id || 0,
            Fork: selectedParts.fork?.Id || 0,
            Wheels: selectedParts.wheels?.Id || 0,
            Tyres: selectedParts.tyres?.Id || 0,
            Drivetrain: selectedParts.drivetrain?.Id || 0,
            Brakes: selectedParts.brakes?.Id || 0,
            Seatpost: selectedParts.seatpost?.Id || 0,
            Saddle: selectedParts.saddle?.Id || 0,
            Bars: selectedParts.bars?.Id || 0,
            Stem: selectedParts.stem?.Id || 0,
            Pedals: selectedParts.pedals?.Id || 0,
            Total: CalculateTotal()
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

            // Briefly change button text to "Added!" to confirm the action to the user
            const basketBtn = document.getElementById("add-to-basket");
            const originalText = basketBtn.textContent;

            basketBtn.textContent = "Added!";

            setTimeout(() => {
                basketBtn.textContent = originalText;
            }, 1000);

            // Refresh the basket count in the nav bar
            LoadBasket();
        })

        .catch(err => {
            console.error(err);
            alert("Error adding to basket");
        });
});



// -------------------------- SAVE BIKE --------------------------

// Handles saving the current build to the user's account when the save button is clicked
document.getElementById("save-bike").addEventListener("click", () => {

    // Prevent saving if the user is not logged in
    if (LoggedInAccountID == null) {
        alert("You are not logged in. Login or signup.");
        return;
    }

    // Check that all required part types for this bike have been selected
    for (const type of desiredOrder) {
        if (partsByType[type] && !selectedParts[type]) {
            alert(`Not all parts selected. Missing: ${type}`);
            return;
        }
    }

    // Build the save data object with the account ID, bike type, and all selected part IDs
    const data = {
        AccountId: LoggedInAccountID,
        BikeType: BikeTypeMap[BikeType] || 1,
        Frame: selectedParts.frame?.Id || 0,
        Shock: selectedParts.shock?.Id || 0,
        Fork: selectedParts.fork?.Id || 0,
        Wheels: selectedParts.wheels?.Id || 0,
        Tyres: selectedParts.tyres?.Id || 0,
        Drivetrain: selectedParts.drivetrain?.Id || 0,
        Brakes: selectedParts.brakes?.Id || 0,
        Seatpost: selectedParts.seatpost?.Id || 0,
        Saddle: selectedParts.saddle?.Id || 0,
        Bars: selectedParts.bars?.Id || 0,
        Stem: selectedParts.stem?.Id || 0,
        Pedals: selectedParts.pedals?.Id || 0
    };

    // Send the save request to the backend API
    fetch("https://localhost:7165/api/bikes/save-bike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(res => {
            if (!res.ok) throw new Error("Save failed");

            // Briefly change button text to "Saved!" to confirm the action to the user
            const saveBtn = document.getElementById("save-bike");
            const originalSaveText = saveBtn.textContent;

            saveBtn.textContent = "Saved!";

            setTimeout(() => {
                saveBtn.textContent = originalSaveText;
            }, 1000);

            // Refresh the basket count in the nav bar
            LoadBasket();
        })

        .catch(err => {
            console.error(err);
            alert("Error saving bike");
        });
});


// -------------------- BASKET BUTTON ---------------------------

// When the basket button is clicked, save the current build state to localStorage
// so it can be restored if the user returns to the builder from the basket page
document.querySelector('.basket').addEventListener('click', () => {

    localStorage.setItem("RedirectBike", JSON.stringify({
        BikeType: BikeTypeMap[BikeType] || 1,
        Frame: selectedParts.frame?.Id || 0,
        Shock: selectedParts.shock?.Id || 0,
        Fork: selectedParts.fork?.Id || 0,
        Wheels: selectedParts.wheels?.Id || 0,
        Tyres: selectedParts.tyres?.Id || 0,
        Drivetrain: selectedParts.drivetrain?.Id || 0,
        Brakes: selectedParts.brakes?.Id || 0,
        Seatpost: selectedParts.seatpost?.Id || 0,
        Saddle: selectedParts.saddle?.Id || 0,
        Bars: selectedParts.bars?.Id || 0,
        Stem: selectedParts.stem?.Id || 0,
        Pedals: selectedParts.pedals?.Id || 0
    }));

    // Navigate to basket with "originator=builder.html" so the back button knows where to return
    window.location.href = "basket.html?originator=builder.html";
});


// -------------------------- INIT --------------------------

/*
    Initialises the builder page:
        1. Loads bike parts for the selected bike type
        2. Loads all reviews
        3. Builds the list of part steps and renders each section
        4. Shows the first step
        5. Restores a saved or redirected build if applicable
*/
async function init() {
    try {
        const { parts, byType } = await LoadParts(PartFile);
        allParts = parts;
        partsByType = byType;

        await LoadReviews();

        // Build the ordered step list using only part types that exist in the loaded data
        BuildSteps = desiredOrder.filter(t => partsByType[t]);
        BuildSteps.forEach(t => RenderPartSection(t, partsByType[t]));

        // Display the first step on load
        if (BuildSteps.length > 0) {
            ShowStep(0);
        }

        // Restore a saved build if the user arrived via the Edit button
        if (isFromSave) {
            LoadSavedBuild();
        }
        // Restore a redirected build if the user returned from the basket page
        if (isFromBasket) {
            LoadRedirectBuild();
            localStorage.removeItem("RedirectBike");    // Clear redirect data after restoring
        }

    } catch (err) {
        console.error("Error initializing builder:", err);
    }
}

init();