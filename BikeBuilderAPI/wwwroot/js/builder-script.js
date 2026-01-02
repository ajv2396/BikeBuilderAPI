let LoggedInAccountID = null;
let total;
const BikeTypeMap = { enduro: 1, dh: 2, dj: 3 };

//------------------DETECT IF USER COMES FROM EDIT MODE--------------
const qs = new URLSearchParams(window.location.search);
const isFromSave = qs.get("fromsave") === "true";

let savedBike = null;

if (isFromSave) {
    const raw = localStorage.getItem("editBike");
    if (raw) {
        savedBike = JSON.parse(raw);
    }
}

// -------------------------- LOAD SESSION --------------------------
fetch("user_session.json")
    .then((response) => {
        if (!response.ok) throw new Error("Response was not ok");
        return response.json();
    })
    .then((data) => {
        console.log("Session:", data);
        LoggedInAccountID = data.AccountId;
    })
    .catch((error) => console.error("Error fetching session:", error));

//--------------------------- LOAD REVIEWS -----------------------------
let AllReviews = [];

async function LoadReviews() {
    try {
        const resp = await fetch("reviews/reviews.json");
        if (!resp.ok) throw new Error("Failed to load reviews");
        AllReviews = await resp.json();

    } catch (err) {
        console.error("Error loading reviews:", err);
    }
}
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
function GetBikeType() {
    const qs = new URLSearchParams(window.location.search);
    return (
        qs.get("bike") ||
        localStorage.getItem("bikeType") ||
        "enduro"
    ).toLowerCase();
}

const BikeType = GetBikeType();
const BikeTypeIdentification = BikeTypeMap[BikeType] || 1;
const fileMap = {
    enduro: "bike-parts/enduro_parts.json",
    dh: "bike-parts/dh_parts.json",
    dj: "bike-parts/dj_parts.json",
};
const PartFile = fileMap[BikeType];

// ---------- CHANGE ORDER OF DISPLAY FOR DIFFERENT TYPES ---------
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

const bikeDisplay = document.getElementById("bike-display");
bikeDisplay.innerHTML = "";

const layerOrder = bikeLayerOrders[BikeTypeIdentification] || bikeLayerOrders[1];

layerOrder.forEach(part => {
    const img = document.createElement("img");
    img.id = `${part}-img`;
    bikeDisplay.appendChild(img);
});


// -------------------------- LOAD PARTS --------------------------
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
function LoadSavedBuild() {
    if (!savedBike) return;

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

    // Select frame 
    if (idMap.frame) {
        const frame = allParts.find(p => p.Id === idMap.frame);
        if (frame) SelectPart(frame);
    }

    // Select remaining parts
    Object.entries(idMap).forEach(([type, id]) => {
        if (!id || type === "frame") return;
        const part = allParts.find(p => p.Id === id);
        if (part) SelectPart(part);
    });

    //remove the edit bike from local storage
    localStorage.removeItem("editBike");
}


// -------------------------- UI ORDER --------------------------
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

const frameSpecificTypes = new Set(["saddle", "seatpost", "shock", "brakes"]);


// -------------------------- RENDER PARTS --------------------------
function RenderPartSection(partType, items) {
    const container = document.createElement("div");
    container.id = `step-${partType}`;
    container.className = "bike-part-select";
    container.style.display = "none";

    const label = document.createElement("label");
    label.textContent =
        "Choose " + partType[0].toUpperCase() + partType.slice(1) + ":";
    container.appendChild(label);

    const optionsDiv = document.createElement("div");
    optionsDiv.className = `${partType}-options`;

    items.forEach((item) => {
        //Reviews
        const PartReviews = AllReviews.filter(r => r.BikePartID === item.Id);

        let NumberOfReviews = "0";
        let avg = 0;
        let StarsHtml = "";
        NumberOfReviews = PartReviews.length;


        if (PartReviews.length > 0) {
            avg = PartReviews.reduce((a, r) => a + r.Rating, 0) / PartReviews.length;
        }
        StarsHtml = `<span class="stars">${RenderStars(avg)}</span>`;

        const opt = document.createElement("div");
        opt.className = `part-option ${partType}-option`;
        opt.dataset.id = item.Id;
        opt.dataset.image = item.ImagePath;
        opt.dataset.BikeTypeId = item.BikeTypeId;
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
        //more button
        const MoreInfoButton = opt.querySelector("button");
        MoreInfoButton.addEventListener("click", () => {
            const url = `part-details.html?id=${encodeURIComponent(item.Id)}&TypeId=${encodeURIComponent(item.BikeTypeId)}`;

            window.open(url, "_blank"); // _blank for opening in new tab
        });


        optionsDiv.appendChild(opt);
    });

    container.appendChild(optionsDiv);

    const selectorBar = document.querySelectorAll(".part-selector-bar")[1];
    const nextButton = selectorBar.querySelector(".next-button");
    selectorBar.insertBefore(container, nextButton);
}

// -------------------------- UPDATE PRICING --------------------------
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

let FrameSelected = "";
const selectedParts = {};
let allParts = [];
let partsByType = {};
let BuildSteps = [];
let currentStep = 0;

// -------------------------- SELECT PART --------------------------
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

function SelectPart(part) {
    if (!part || !part.PartType) return;

    const imgId = imageMap[part.PartType];
    if (!imgId) return;

    const base = `images/${BikeType[0].toUpperCase() + BikeType.slice(1)}`;
    const folder = folderMap[part.PartType];
    if (!folder) return;

    // Helper to build full image path
    const getSrc = (imageName) => {
        if (!imageName) return null;

        if (frameSpecificTypes.has(part.PartType)) {
            const sep = part.Separator || "_";
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
    if (part.PartType === "drivetrain") {
        if (!part.ImagePath) {
            console.warn("Drivetrain part has no ImagePath:", part);
            return;
        }

        const frontId = imageMap["drivetrain"];
        const rearId = imageMap["drivetrain-rear"];

        const frontSrc = getSrc(part.ImagePath + ".png");
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

    // Store selected part
    selectedParts[part.PartType] = part;
    UpdateTotalPrice();

    // --- Update frame-specific parts if frame changes ---
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
function ShowStep(index) {
    BuildSteps.forEach((step, i) => {
        const el = document.getElementById(`step-${step}`);
        el.style.display = i === index ? "block" : "none";
    });

    currentStep = index;
}


document.querySelector(".prev-button").addEventListener("click", () => {
    if (currentStep > 0) ShowStep(currentStep - 1);
});

document.querySelector(".next-button").addEventListener("click", () => {
    if (currentStep < BuildSteps.length - 1) ShowStep(currentStep + 1);
});


// -------------------------- EVENT HANDLER --------------------------
document.querySelectorAll(".part-selector-bar")[1].addEventListener("click", (e) => {
    const opt = e.target.closest(".part-option");
    if (!opt) return;
    const id = opt.dataset.id;
    const part = allParts.find((p) => String(p.Id) === id);
    if (part) {
        // Remove 'selected' from all options of this type
        document.querySelectorAll(`.${part.PartType}-option`).forEach(el => el.classList.remove('selected'));
        // Add 'selected' to clicked option
        opt.classList.add('selected');

        SelectPart(part);
    }
});

// -------------------------- BASKET REDIRECT --------------------
document.querySelector('.basket').addEventListener('click', () => {
    window.location.href = 'basket.html';
});

// ----------------------CALCULATE TOTAL FOR BASKET -------------------
function CalculateTotal() {
    let sum = 0;
    Object.values(selectedParts).forEach(part => {
        if (part.Price) sum += part.Price;
    });
    return sum;
}


// ----------------------- ADD TO BASKET --------------------------
document.getElementById("add-to-basket").addEventListener("click", () => {
    if (LoggedInAccountID == null) {
        alert("You are not logged in. Login or signup.");
        return;
    }

    for (const type of desiredOrder) {
        if (partsByType[type] && !selectedParts[type]) {
            alert(`Not all parts selected. Missing: ${type}`);
            return;
        }
    }

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

    fetch("https://localhost:7165/api/basket/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(BasketData)
    })
        .then(res => res.ok ? alert("Bike added to basket!") : alert("Failed to add: " + res.status))
        .catch(err => console.error("Error adding to basket:", err));
});



// -------------------------- SAVE BIKE --------------------------
document.getElementById("save-bike").addEventListener("click", () => {
    if (LoggedInAccountID == null) {
        alert("You are not logged in. Login or signup.");
        return;
    }

    for (const type of desiredOrder) {
        if (partsByType[type] && !selectedParts[type]) {
            alert(`Not all parts selected. Missing: ${type}`);
            return;
        }
    }

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




    fetch("https://localhost:7165/api/bikes/save-bike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((res) =>
            res.ok
                ? alert("Bike Configuration Saved!")
                : alert("Save failed: " + res.status)
        )
        .catch((err) => console.error("Error saving bike:", err));
});

// -------------------------- INIT --------------------------
async function init() {
    try {
        const { parts, byType } = await LoadParts(PartFile);
        allParts = parts;
        partsByType = byType;

        await LoadReviews();

        BuildSteps = desiredOrder.filter(t => partsByType[t]);
        BuildSteps.forEach(t => RenderPartSection(t, partsByType[t]));

        if (BuildSteps.length > 0) {
            ShowStep(0);
        }

        // load saved bike
        if (isFromSave) {
            LoadSavedBuild();
        }

    } catch (err) {
        console.error("Error initializing builder:", err);
    }
}

init();