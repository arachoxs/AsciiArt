import { asciiVideo, asciiImage, cleanBoard, changeStyle, activateDynamicColors, downloadFrame, chars, revertCharSet, setInputs } from "./asciiService.mjs";

const cameraButton = document.getElementById("camera-input");
const styleForm = document.getElementById("style-form");
const imageInput = document.getElementById("image-input");

// Populate charset select

export function updateCharSetSelect(chars, charsIndexSelected = 0) {
    const charSetInput = document.getElementById("charset-input");
    charSetInput.innerHTML = "";
    chars.forEach((charSet, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = charSet.substring(0, 20) + (charSet.length > 20 ? "..." : ""); // Truncate for display
        if (index == charsIndexSelected) option.selected = true; // Use loose equality for safety with form data strings
        charSetInput.appendChild(option);
    });
}

const downloadButton = document.getElementById("download-button");
const captionButton = document.getElementById("caption-button");

const changeCameraButton = document.getElementById("change-camera-button");

let mediaObj;
let useCamera = false;

//el event de use image
imageInput.addEventListener("change", () => {
    const input = imageInput.files[0];
    if (input) {
        cameraDesactivate();
        cleanBoard();

        console.log("se subieron archivos");
        asciiImage(input);
    }
})

//evento de use Camera
cameraButton.addEventListener("click", () => {
    if (!useCamera) {
        cameraActivate();
    } else {
        cameraDesactivate();
    }
});

//evento de download button

downloadButton.addEventListener("click", downloadFrame);
captionButton.addEventListener("click", downloadFrame);

var front = false;

changeCameraButton.addEventListener("click", () => {
    front = !front;
    if (useCamera) {
        cameraDesactivate();
        cameraActivate();
    }
})


function cameraDesactivate() {
    if (mediaObj) {
        const cameraOptions = document.getElementById("camera-options");
        cleanBoard();

        cameraOptions.style.display = "none";

        let videoTrack = mediaObj.getVideoTracks()[0];

        useCamera = false;
        cameraButton.getElementsByTagName("p")[0].textContent = "Use Camera";
        videoTrack.stop();
        mediaObj.removeTrack(videoTrack);

        mediaObj = null;
        console.log(mediaObj);
    }
}

export function cameraActivate() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: front ? "user" : "environment" }, audio: false }).then(res => {
        if (imageInput) {
            imageInput.value = "";
            cleanBoard();
        }

        const cameraOptions = document.getElementById("camera-options");

        cameraOptions.style.display = "";


        useCamera = true;
        cameraButton.getElementsByTagName("p")[0].textContent = "deactivate Camera";
        asciiVideo(res, front);
        mediaObj = res;
    })
}

//se obtiene la informacion del formualrio

styleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    var formData = new FormData(styleForm);
    activateDynamicColors(document.getElementById("dynamic-colors-input").checked);

    // Apply changes usually
    revertCharSet(document.getElementById("revert-charset-input").checked);
    changeStyle(Object.fromEntries(formData));

    // Update UI because charset might have been reverted/changed
    // We get the charset index from the form data
    updateCharSetSelect(chars, formData.get("charSet"));

    const input = imageInput.files[0];
    if (input) {
        asciiImage(input)
    }
})

// Initialize UI
setInputs();
updateCharSetSelect(chars);
