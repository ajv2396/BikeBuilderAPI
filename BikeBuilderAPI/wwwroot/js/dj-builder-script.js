﻿let LoggedInAccountID;

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

        const FirstName = data.FirstName;
        const LastName = data.LastName;
        LoggedInAccountID = data.AccountId;
        const Email = data.Email;
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    })


//get which html file is being used so that the bike type can be set
let IsEnduroSelected = window.IsEnduroSelected || false;
let IsDHSelected = window.IsDHSelected || false;

let BikeType;

//set bike type. for using for displaying images (correct file path) and using in database
BikeType = "DJ";

let StepOfBuild = 0;
const BuildSteps = [
    "step-frame",
    "step-fork",
    "step-wheels",
    "step-tyres",
    "step-drivetrain",
    "step-brakes",
    "step-pedals",
    "step-stem",
    "step-bars",
    "step-seatpost",
    "step-saddle",
];

let frame = "";
let shock = "shock0"
let fork = "";
let wheels = "";
let tyres = "";
let drivetrain = "";
let brakes = "";
let seatpost = "";
let saddle = "";
let bars = "";
let stem = "";
let pedals = "";


let FrameSelected = "";

let IsSeatpostSelected = false;
let IsSaddleSelected = false;
let IsBrakesSelected = false;
let SeatpostSelected = "";
let SaddleSelected = "";
let BrakesSelected = "";


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
        if (StepOfBuild == BuildSteps.length - 1) {
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
            if (IsBrakesSelected === true) {
                document.getElementById("brakes-img").src = `images/${BikeType}/frame-specific/brakes/${BrakesSelected}_${FrameSelected}`;
            }
            if (IsSeatpostSelected === true) {
                document.getElementById("seatpost-img").src = `images/${BikeType}/frame-specific/seatposts/${SeatpostSelected}_${FrameSelected}`;

            }
            if (IsSaddleSelected === true) {
                document.getElementById("saddle-img").src = `images/${BikeType}/frame-specific/saddles/${SaddleSelected}_${FrameSelected}`;
            }
            frame = imageName.replace(".png", "");

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

    //BRAKES
    document.querySelectorAll(".brakes-option").forEach(option => {
        option.addEventListener("click", () => {
            const imageName = option.dataset.image;
            document.getElementById("brakes-img").src = `images/${BikeType}/frame-specific/brakes/${imageName}_${FrameSelected}`;
            document.querySelectorAll(".brakes-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");
            IsBrakesSelected = true;
            BrakesSelected = null;
            BrakesSelected = imageName;
            brakes = imageName.replace(".png", "");
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

        if (LoggedInAccountID == null) {
            alert("You are not logged in. Login or signup.")
            return;
        }

        const data = {
            AccountId: LoggedInAccountID,
            biketype: BikeType, //also send bike type so different bikes can be differentiated
            frame: frame,
            shock: shock,
            fork: fork,
            wheels: wheels,
            tyres: tyres,
            drivetrain: drivetrain,
            brakes: brakes,
            seatpost: seatpost,
            saddle: saddle,
            bars: bars,
            stem: stem,
            pedals: pedals
        };
        // For if not all bike parts are selected
        for (let key in data) {
            if (!data[key]) {
                alert("Not all parts selected. Save failed")
                return;
            }
        }

        fetch("https://localhost:7165/api/bikes/save-bike", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(res => res.ok ? alert("Bike Configuration Saved!") : alert("Save failed" + LoggedInAccountID))
            .catch(err => console.error("Error saving bike:", err));
    })
});
