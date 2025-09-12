let LoggedInAccountID = null;

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
const fileMap = {
    enduro: "bike-parts/enduro_parts.json",
    dh: "bike-parts/dh_parts.json",
    dj: "bike-parts/dj_parts.json",
};
const PartFile = fileMap[BikeType];

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
        opt.dataset.framespecific = frameSpecificTypes.has(partType) ? "1" : "0";
        opt.innerHTML = `
        <img src="${item.ThumbnailPath}" alt="${item.Name}">
        <p class="part-name">${item.Name}</p>
        <p class="part-description">&pound;${item.Price} | ${item.Weight}g <br> ${item.Description} <br> <br> ${StarsHtml} (${NumberOfReviews})</p >

    `;

        optionsDiv.appendChild(opt);
    });

    container.appendChild(optionsDiv);

    const selectorBar = document.querySelectorAll(".part-selector-bar")[1];
    const nextButton = selectorBar.querySelector(".next-button");
    selectorBar.insertBefore(container, nextButton);
}

// -------------------------- UPDATE PRICING --------------------------
function UpdateTotalPrice() {
    let total = 0;
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

    // Toggle back button
    document.querySelector(".back-button").style.display =
        index > 0 ? "block" : "none";

    // Toggle return button
    document.querySelector(".return-button").style.display =
        index === 0 ? "block" : "none";

    currentStep = index;
}

document.getElementById("back-button").addEventListener("click", () => {
    if (currentStep > 0) ShowStep(currentStep - 1);
});

document.querySelector(".prev-button").addEventListener("click", () => {
    if (currentStep > 0) ShowStep(currentStep - 1);
});

document.querySelector(".next-button").addEventListener("click", () => {
    if (currentStep < BuildSteps.length - 1) ShowStep(currentStep + 1);
});

document.getElementById("return-button").addEventListener("click", () => {
    ShowStep(0);
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
        biketype: BikeType,
        parts: Object.fromEntries(
            Object.entries(selectedParts).map(([type, part]) => [type, part.Id])
        ),
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

        BuildSteps = desiredOrder.filter((t) => partsByType[t]);
        BuildSteps.forEach((t) => RenderPartSection(t, partsByType[t]));

        if (BuildSteps.length > 0) {
            ShowStep(0);
        }

        console.log("Loaded bike parts for", BikeType, partsByType);
    } catch (err) {
        console.error("Error initializing builder:", err);
    }
}

init();
