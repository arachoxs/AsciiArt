import { asciiGenerator } from "./asciiService.mjs";

const MEDIAW = 1280;
const MEDIAH = 720;

const cameraButton = document.getElementById("camera-trigger");
let useCamera = false;

cameraButton.addEventListener("click",()=>{
    if(!useCamera){
        handleCameraActivate();
        useCamera=true;
        cameraButton.getElementsByTagName("p")[0].textContent="Desactivar Camara";
    }else{
        
    }
});

export function handleCameraActivate(){
    navigator.mediaDevices.getUserMedia({ video: { width: MEDIAW, height: MEDIAH }, audio: false }).then(res => {
        asciiGenerator(res);
    })
}