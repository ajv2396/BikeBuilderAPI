

//get which html file is being used so that the bike type can be set
let IsEnduroSelected = window.IsEnduroSelected || false;
let IsDHSelected = window.IsDHSelected || false;

let BikeType;

//set bike type. for using for displaying images (correct file path) and using in database
if (IsDHSelected == true) {
    BikeType = "DH";
}
if (IsEnduroSelected == true) {
    BikeType = "Enduro";
}

let StepOfBuild = 0;
const BuildSteps = [
    "step-frame",
    "step-shock",
    "step-fork",
    "step-wheels",
    "step-tyres",
    "step-drivetrain",
    "step-pedals",
    "step-stem",
    "step-bars",
    "step-seatpost",
    "step-saddle",
];

let frame = "";
let shock = "";
let fork = "";
let wheels = "";
let tyres = "";
let drivetrain = "";
let seatpost = "";
let saddle = "";
let bars = "";
let stem = "";
let pedals = "";


let FrameSelected = "";

let IsSeatpostSelected = false;
let IsSaddleSelected = false;
let IsShockSelected = false;
let SeatpostSelected = "";
let SaddleSelected = "";
let ShockSelected = "";


document.addEventListener("DOMContentLoaded", () => {
    // -------------------------- NEXT STEP --------------------------
    document.getElementById("next-button").addEventListener("click", () => {
        //hide current step of the build
        if (StepOfBuild < BuildSteps.length) {
            const CurrentStep = document.getElementById(BuildSteps[StepOfBuild]);
            if (CurrentStep) CurrentStep.style.display = "none";
        }
        StepOfBuild++;
        //for showing next step
        if (StepOfBuild < BuildSteps.length) {
            const NextStep = document.getElementById(BuildSteps[StepOfBuild]);
            if (NextStep) NextStep.style.display = "flex";
        } else {
        }
        //show back button
        if (StepOfBuild > 0) {
            document.querySelector(".back-button").style.display = "flex";
        }
        else {
            document.querySelector(".back-button").style.display = "none";
        }
        //show return button
        if (StepOfBuild > 1) {
            document.querySelector(".return-button").style.display = "flex";
        }
        else {
            document.querySelector(".return-button").style.display = "none";
        }

        // Change next button to finish build
        if (StepOfBuild == BuildSteps.length -1 ) {
            document.getElementById("next-button").textContent = "Finish";
        }
        //Hide Next Button after complete & return to build button 
        if (StepOfBuild == BuildSteps.length) {
            document.getElementById("next-button").style.display = "none";
            document.getElementById("back-button").textContent = "Return to Build"
            ShowBuildInfo();
        }

    });

    document.getElementById(BuildSteps[StepOfBuild]).style.display = "flex";


    // -------------------------- BACK BUTTON --------------------------
    document.getElementById("back-button").addEventListener("click", () => {
        if (StepOfBuild > 0) {
            //hide current step only if its within bounds
            if (StepOfBuild < BuildSteps.length) {
                const CurrentStep = document.getElementById(BuildSteps[StepOfBuild]);
                if (CurrentStep) CurrentStep.style.display = "none";
            }

            StepOfBuild--;

            const PrevStep = document.getElementById(BuildSteps[StepOfBuild]);
            if (PrevStep) PrevStep.style.display = "flex";

            //update next button text
            document.getElementById("next-button").textContent = "Next";
            document.getElementById("next-button").style.display = "flex";
            document.getElementById("back-button").textContent = "Back" //change back button (for if it is set as "return to build")

            //hide back button if its at the start
            if (StepOfBuild === 0) {
                document.querySelector(".back-button").style.display = "none";
            }
        }
    });

    // -------------------------- RETURN BUTTON --------------------------
    document.getElementById("return-button").addEventListener("click", () => {
        if (StepOfBuild > 1) {
            //hide current step only if its within bounds
            if (StepOfBuild < BuildSteps.length) {
                const CurrentStep = document.getElementById(BuildSteps[StepOfBuild]);
                if (CurrentStep) CurrentStep.style.display = "none";
            }

            StepOfBuild = 0;

            const PrevStep = document.getElementById(BuildSteps[StepOfBuild]);
            if (PrevStep) PrevStep.style.display = "flex";

            //update next button text
            document.getElementById("next-button").textContent = "Next";
            document.getElementById("next-button").style.display = "flex";
            document.getElementById("back-button").textContent = "Back" //change back button (for if it is set as "return to build")

            document.querySelector(".back-button").style.display = "none";
            document.querySelector(".return-button").style.display = "none";
        }
    });



    // -------------------------- CLICK EVENTS --------------------------
    //FRAME
    document.querySelectorAll(".frame-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("frame-img").src = `images/${BikeType}/frames/${imageName}`;
            document.querySelectorAll(".frame-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            FrameSelected = imageName; //SET FRAME SELECTED TO IMAGE CLICKED ON - SO SADDLES/SEATPOSTS ARE CORRECT

            //Check if both are already selected so if user goes back and changes frame then the saddle and/or seatpost are updated
            if (IsShockSelected === true) {
                document.getElementById("shock-img").src = `images/${BikeType}/frame-specific/shocks/${ShockSelected}_${FrameSelected}`;

            }
            if (IsSeatpostSelected === true) {
                document.getElementById("seatpost-img").src = `images/${BikeType}/frame-specific/seatposts/${SeatpostSelected}-${FrameSelected}`;

            }
            if (IsSaddleSelected === true) {
                document.getElementById("saddle-img").src = `images/${BikeType}/frame-specific/saddles/${SaddleSelected}_${FrameSelected}`;
            }
            frame = imageName.replace(".png", "");

        });
    });

    //SHOCKS
    document.querySelectorAll(".shock-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("shock-img").src = `images/${BikeType}/frame-specific/shocks/${imageName}_${FrameSelected}`;
            document.querySelectorAll(".shock-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            IsShockSelected = true;
            ShockSelected = null;
            ShockSelected = imageName;
            shock = imageName.replace(".png", "");
        });
    });

    //FORKS
    document.querySelectorAll(".fork-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("fork-img").src = `images/${BikeType}/forks/${imageName}`;
            document.querySelectorAll(".fork-option, .dh-fork-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            fork = imageName.replace(".png", "");
        });
    });


    //WHEELS
    document.querySelectorAll(".wheels-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("wheels-img").src = `images/${BikeType}/wheels/${imageName}`;
            document.querySelectorAll(".wheels-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            wheels = imageName.replace(".png", "");
        });
    });
    //TYRES
    document.querySelectorAll(".tyres-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("tyres-img").src = `images/${BikeType}/tyres/${imageName}`;
            document.querySelectorAll(".tyres-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            tyres = imageName.replace(".png", "");
        });
    });
    //DRIVETRAIN
    document.querySelectorAll(".drivetrain-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("drivetrain-img").src = `images/${BikeType}/drivetrains/${imageName}.png`;
            document.getElementById("drivetrain-rear-img").src = `images/${BikeType}/drivetrains/${imageName}-rear.png`;
            document.querySelectorAll(".drivetrain-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            drivetrain = imageName.replace(".png", "");
        });
    });
    //PEDALS
    document.querySelectorAll(".pedals-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("pedals-img").src = `images/${BikeType}/pedals/${imageName}`;
            document.querySelectorAll(".pedals-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            pedals = imageName.replace(".png", "");
        });
    });
    //STEM
    document.querySelectorAll(".stem-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("stem-img").src = `images/${BikeType}/stems/${imageName}`;
            document.querySelectorAll(".stem-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            stem = imageName.replace(".png", "");
        });
    });

    //BARS
    document.querySelectorAll(".bars-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("bars-img").src = `images/${BikeType}/bars/${imageName}`;
            document.querySelectorAll(".bars-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            bars = imageName.replace(".png", "");
        });
    });

    //SEATPOSTS
    document.querySelectorAll(".seatpost-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("seatpost-img").src = `images/${BikeType}/frame-specific/seatposts/${imageName}-${FrameSelected}`;
            document.querySelectorAll(".seatpost-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            IsSeatpostSelected = true;
            SeatpostSelected = null;
            SeatpostSelected = imageName;
            seatpost = imageName;
        });
    });

    //SADDLES
    document.querySelectorAll(".saddle-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("saddle-img").src = `images/${BikeType}/frame-specific/saddles/${imageName}_${FrameSelected}`;
            document.querySelectorAll(".saddle-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            IsSaddleSelected = true;
            SaddleSelected = null;
            SaddleSelected = imageName;
            saddle = imageName;
        });
    });


    // -------------------------- SAVE BUTTON --------------------------

    document.getElementById("save-button").addEventListener("click", () => {

        const data = {
            biketype: BikeType, //also send bike type so different bikes can be differentiated
            frame: frame,
            shock: shock,
            fork: fork,
            wheels: wheels,
            tyres: tyres,
            drivetrain: drivetrain,
            seatpost: seatpost,
            saddle: saddle,
            bars: bars,
            stem: stem,
            pedals: pedals
        };
        // For if not all bike parts are selected
        for (let key in data){
            if (!data[key]) {
                alert("Not all parts selected. Save failed")
                return;
            }
        }

        fetch("https://localhost:7165/api/bikes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(res => res.ok ? alert("Bike Configuration Saved!") : alert("Save failed"))
            .catch(err => console.error("Error saving bike:", err));
    })
});
