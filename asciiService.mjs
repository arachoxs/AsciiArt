const canvas = document.getElementById("canvas-container");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const chars = "@#W$9876543210?!abc;:+=-,._";
const asciiContainer = document.getElementById("ascii-container");

let config = {
    letterSpacing:4,
    lineHeight:7,
    fontSize:10
}

//se calcula desde un inicio el tamaño de los caracteres 
let characterSize = calcSize();

let intervalId;

let useColors = document.getElementById("dynamic-colors-input").checked;

function calcSize(){
    const characterDiv = document.createElement("span");
    characterDiv.textContent="A";
    characterDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        font-size: ${config.fontSize}px;
        letter-spacing: ${config.letterSpacing}px;
        line-height: ${config.lineHeight}px;
    `;

    asciiContainer.appendChild(characterDiv);

    let { width, height } = characterDiv.getBoundingClientRect();
    asciiContainer.removeChild(characterDiv);

    asciiContainer.style.fontSize = config.fontSize + "px";
    asciiContainer.style.lineHeight = config.lineHeight + "px";
    asciiContainer.style.letterSpacing = config.letterSpacing + "px";

    return {width,height};
}

//se debe poder cambiar el estilo y recargar el frame con el nuevo estilo
export function changeStyle(styles){
    
    for(const style in styles){
        if (styles[style]){
            config[style]=parseInt(styles[style]).toFixed(2);
        }
    }

    characterSize = calcSize(); //se recalculan los tamaños
    whiteBoard(); //se limpia el tablero
    return;
}

export function activateDynamicColors(value){
    useColors=value;
    return;
}

function whiteBoard(){
    asciiContainer.innerHTML="";
    asciiContainer.textContent="";
    return;
}

export function cleanBoard(){
    clearInterval(intervalId);
    whiteBoard();
    console.log("board Cleaned");
    return;
}

function asciiFrame(element,width,height){
    ctx.drawImage(element, 0, 0, width, height); // se dibuja
    const data = ctx.getImageData(0, 0, width, height).data; //se obtiene la informacion de los pixeles
        
    // tamaño del contenedor ASCII (CSS px)
    const asciiW = asciiContainer.getBoundingClientRect().width;
    const asciiH = asciiContainer.getBoundingClientRect().height;

    console.log(asciiW,asciiH);
    // cantidad de caracteres que caben
    const cols = Math.floor(asciiW / characterSize.width);
    const rows = Math.floor(asciiH / characterSize.height);

    // factores de escala (video px / caracter)
    const scaleX = width / cols;
    const scaleY = height / rows;

    whiteBoard();

    let ascii = "";
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // mapeo de grilla ASCII → video
            const px = Math.floor(x * scaleX);
            const py = Math.floor(y * scaleY);
            const pixelIndex = (py * width + px) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const index = Math.floor(lum / 255 * (chars.length - 1));

            if(useColors){
                const hex =
                    "#" +
                    r.toString(16).padStart(2, "0") +
                    g.toString(16).padStart(2, "0") +
                    b.toString(16).padStart(2, "0");
            

                ascii += `<span style="color:${hex}">${chars[index]}</span>`;
            }else{
                ascii+=chars[index];
            }
        }

        ascii+="<br/>";
    }

    asciiContainer.innerHTML = ascii;

    return;
}   

export async function asciiImage(file){
    const reader = new FileReader();
    let url;

    await new Promise((resolve,reject)=>{
        reader.addEventListener("load", () => {
            resolve(reader.result);
        });

        return reader.readAsDataURL(file)
    }).then((res)=>{
        url=res;
    })

    let newImage = document.getElementById("img-container");
    newImage.setAttribute("src",url);

    let width;
    let height;

    await new Promise((resolve)=>{
        newImage.onload = () =>{
            resolve({width:newImage.width,height:newImage.height})
        }
    }).then((res)=>{
        width = res.width;
        height = res.height;
    })
    
    console.log(width,height);
    
    canvas.width = width;
    canvas.height = height;

    //el contenedor toma el tamaño de la imagen para posteriormente dentor de ascci frame segun los tamaños de los caracteres se escale
    asciiContainer.style.minWidth = width + "px"; 
    asciiContainer.style.minHeight = height + "px";

    const asciiW = asciiContainer.getBoundingClientRect().width;
    const asciiH = asciiContainer.getBoundingClientRect().height;
    
    console.log(asciiW,asciiH);
    
    asciiFrame(newImage,width,height);
}

//we have to send the video to a canvas
export function asciiVideo(stream) {
    const videoElement = document.getElementById("video-container");

    videoElement.srcObject = stream;
    videoElement.play();
    videoElement.style="display:none";

    //se obtiene la configuración de w,h del video
    const track = stream.getVideoTracks()[0];
    const { width, height } = track.getSettings();

    //se obtiene el canva para procesar el frame
    canvas.width = width;
    canvas.height = height;
    canvas.style="display:none";

    //para camara se mantiene el ancho del componente padre

    asciiContainer.style.minWidth = "100%";
    asciiContainer.style.minHeight = "100%";

    console.log("entro");
        
    /*el recorte de la imagenn va a depender de: 
        -tamaño de la fuente
        -line-height
        -letter-spacing
        -tamaño disponible del elemento que contendra la imagen ascii
    */
    
    //como es un texto necesitamos actualizar continuamente nuestro contenedor
    intervalId = setInterval(() => {
        asciiFrame(videoElement,width,height);
    }, 100);
}
