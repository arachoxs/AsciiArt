let letterSpacing=3;
let lineHeight=10;
let fontSize=10;

//vamos a calcular el ancho de nuestros caracteres desde la carga incial

const characterDiv = document.createElement("span");
characterDiv.textContent="A";
characterDiv.style.cssText = `
    position: absolute;
    visibility: hidden;
    font-family: monospace;
    font-size: ${fontSize}px;
    letter-spacing: ${letterSpacing}px;
    line-height: ${lineHeight}px;
`;

document.body.appendChild(characterDiv);

let { width: characterWidth, height:characterHeight } = characterDiv.getBoundingClientRect();

document.body.removeChild(characterDiv);

console.log(characterWidth, characterHeight);

const videoElement = document.getElementById("video-container");
const chars = ".'`^\",:;Il!i><~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const asciiContainer = document.getElementById("ascii-container");
let intervalId;

export function cleanBoard(){
    clearInterval(intervalId);
    asciiContainer.innerHTML="";
    asciiContainer.textContent="";
    console.log("board Cleaned");
}

//we have to send the video to a canvas
export function asciiGenerator(stream) {
    videoElement.srcObject = stream;
    videoElement.play();
    videoElement.style="display:none";

    //se necesita enviar el video a un canva para leer cada pixel del frame
    const canvas = document.getElementById("canvas-container");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    //se obtiene la configuración de w,h del video
    const track = stream.getVideoTracks()[0];
    const { width, height } = track.getSettings();

    //se obtiene el canva para procesar el frame
    canvas.width = width;
    canvas.height = height;
    canvas.style="display:none";

    asciiContainer.style = `font-size:${fontSize}px; text:black; line-height:${lineHeight}px; letter-spacing:${letterSpacing}px;`;
    
    /*el recorte de la imagenn va a depender de: 
        -tamaño de la fuente
        -line-height
        -letter-spacing
        -tamaño disponible del elemento que contendra la imagen ascii
    */
    
    //como es un texto necesitamos actualizar continuamente nuestro contenedor
    intervalId = setInterval(() => {
        ctx.drawImage(videoElement, 0, 0, width, height);
        const data = ctx.getImageData(0, 0, width, height).data;

        // tamaño del contenedor ASCII (CSS px)
        const asciiW = asciiContainer.getBoundingClientRect().width;
        const asciiH = asciiContainer.getBoundingClientRect().height;

        console.log(asciiW,asciiH);

        // cantidad de caracteres que caben
        const cols = Math.floor(asciiW / characterWidth);
        const rows = Math.floor(asciiH / characterHeight);

        // factores de escala (video px / caracter)
        const scaleX = Math.floor(width / cols);
        const scaleY = Math.floor(height / rows);

        let ascii = "";

        for (let y = 0; y < rows; y++) {
            for (let x = cols-1; x >= 0; x--) {

                // mapeo de grilla ASCII → video
                const px = x * scaleX;
                const py = y * scaleY;

                const pixelIndex = (py * width + px) * 4;

                const r = data[pixelIndex];
                const g = data[pixelIndex + 1];
                const b = data[pixelIndex + 2];

                const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                const index = Math.floor(lum / 255 * (chars.length - 1));

                const hex =
                    "#" +
                    r.toString(16).padStart(2, "0") +
                    g.toString(16).padStart(2, "0") +
                    b.toString(16).padStart(2, "0");

                ascii += `<span style="color:${hex}">${chars[index]}</span>`;
            }
            ascii += "\n";
        }

        asciiContainer.innerHTML = ascii;

}, 100);

}
