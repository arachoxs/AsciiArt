import { asciiGenerator , cleanBoard } from "./asciiService.mjs";

const MEDIAW = 1280;
const MEDIAH = 720;
let mediaObj;

const cameraButton = document.getElementById("camera-trigger");
let useCamera = false;

cameraButton.addEventListener("click",()=>{
    if(!useCamera){
        cameraActivate();
        useCamera=true;
        cameraButton.getElementsByTagName("p")[0].textContent="Desactivar Camara";
    }else{
        cameraDesactivate();
        cleanBoard();
        useCamera=false;
        cameraButton.getElementsByTagName("p")[0].textContent="Use Camera";
    }
});

function cameraDesactivate(){
    let videoTrack = mediaObj.getVideoTracks()[0];
    mediaObj.removeTrack(videoTrack);
    console.log(mediaObj);
}

export function cameraActivate(){
    navigator.mediaDevices.getUserMedia({ video: { width: MEDIAW, height: MEDIAH }, audio: false }).then(res => {
        asciiGenerator(res);
        mediaObj=res;
    })
}