import { asciiVideo ,asciiImage, cleanBoard , changeStyle, activateDynamicColors} from "./asciiService.mjs";

const MEDIAW = 1280;
const MEDIAH = 720;
let mediaObj;

const cameraButton = document.getElementById("camera-trigger");
const styleForm = document.getElementById("style-form");
const imageInput = document.getElementById("image-input")
let useCamera = false;

//se obtiene el file y luego se debe obtener el url de la img
imageInput.addEventListener("change",()=>{
    const input = imageInput.files[0];
    if(input){
        console.log("se subieron archivos");
        asciiImage(input);
    }
})

cameraButton.addEventListener("click",()=>{
    if(!useCamera){
        cameraActivate();
        useCamera=true;
        cameraButton.getElementsByTagName("p")[0].textContent="deactivate Camera";
    }else{
        cameraDesactivate();
        cleanBoard();
        useCamera=false;
        cameraButton.getElementsByTagName("p")[0].textContent="Use Camera";
    }
});

//se obtiene la informacion del formualrio

styleForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    var formData = new FormData(styleForm);
    console.log(Object.fromEntries(formData));
    activateDynamicColors(document.getElementById("dynamic-colors-input").checked);
    changeStyle(Object.fromEntries(formData))
})


function cameraDesactivate(){
    let videoTrack = mediaObj.getVideoTracks()[0];
    videoTrack.stop();
    mediaObj.removeTrack(videoTrack);
    console.log(mediaObj);
}

export function cameraActivate(){
    navigator.mediaDevices.getUserMedia({ video: { width: MEDIAW, height: MEDIAH }, audio: false }).then(res => {
        asciiVideo(res);
        mediaObj=res;
    })
}