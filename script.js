import { asciiGenerator , cleanBoard , changeStyle} from "./asciiService.mjs";

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

//se obtiene la informacion del formualrio

const styleForm = document.getElementById("style-form");

styleForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    var formData = new FormData(styleForm);
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
        asciiGenerator(res);
        mediaObj=res;
    })
}