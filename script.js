import { asciiVideo ,asciiImage, cleanBoard , changeStyle, activateDynamicColors} from "./asciiService.mjs";

const cameraButton = document.getElementById("camera-input");
const styleForm = document.getElementById("style-form");
const imageInput = document.getElementById("image-input");

let mediaObj;
let useCamera = false;

//el event de use image
imageInput.addEventListener("change",()=>{
    const input = imageInput.files[0];
    if(input){
        cameraDesactivate();
        cleanBoard();
        
        console.log("se subieron archivos");
        asciiImage(input);
    }   
})

//evento de use Camera
cameraButton.addEventListener("click", () => {
    if(!useCamera){
        cameraActivate();
    }else{
        cameraDesactivate();
    }
});

function cameraDesactivate(){
    if(mediaObj){
        cleanBoard();

        let videoTrack = mediaObj.getVideoTracks()[0];

        useCamera=false;
        cameraButton.getElementsByTagName("p")[0].textContent="Use Camera";
        videoTrack.stop();
        mediaObj.removeTrack(videoTrack);

        mediaObj = null;
        console.log(mediaObj);
    }
}

export function cameraActivate(){
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(res => {
        if(imageInput){
            imageInput.value = "";
            cleanBoard();
        }

        useCamera=true;
        cameraButton.getElementsByTagName("p")[0].textContent="deactivate Camera";
        asciiVideo(res);
        mediaObj=res;
    })
}

//se obtiene la informacion del formualrio

styleForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    var formData = new FormData(styleForm);
    console.log(Object.fromEntries(formData));
    activateDynamicColors(document.getElementById("dynamic-colors-input").checked);
    changeStyle(Object.fromEntries(formData));

    const input = imageInput.files[0];
    if(input){
        asciiImage(input)
    }
})
