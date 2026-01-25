// 1. Eliminada la importacion circular de updateCharSetSelect

const canvas = document.getElementById("canvas-container");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

let charSetIndex = 1;

export const chars = [
  // Ultra detallado (máxima precisión de brillo)
    "$@MBHENR#KWXDFPQAg8S9OUZ0CJLIVYxzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,`'. ",

  // Detallado clásico (muy buen balance)
    "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/()1{}[]?-_+~<>i!lI;:,`'. ",

    // Intermedio (buena definición sin ruido)
    "@#W$9876543210?!abc;:+=-,._ ",

    // Balanceado / estándar (el más usado)
    "@%#*+=-:. ",

    // Minimalista (rápido y limpio)
    "#*+=-. ",

    // Numérico (estilo glitch)
    "9876543210 ",

    // Experimental / caos controlado
    "@#$%&*+=-~<>!?;:/\\|[]{}() "
];

const LUMINANCE_WEIGHTS = { R: 0.2126, G: 0.7152, B: 0.0722 };
const REFRESH_RATE_MS = 100;

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight); // se calcula el radio y se toma el menor para que se mantenga la proporcion
    if (ratio < 1) { // verifica que la resolucion objetivo sea menor a la resolucion actual
        return { width: Math.round(srcWidth * ratio), height: Math.round(srcHeight * ratio) };
    }
    return { width: srcWidth, height: srcHeight };
}

const asciiContainer = document.getElementById("ascii-container");

let charSetRevert = false;

let actualElement;
let actualElementSize;
let actualElementName;

let config = {
    letterSpacing: 4,
    lineHeight: 7,
    fontSize: 10
}

let colors = {
    font: "white",
    background: "black",
}

//se calcula desde un inicio el tamaño de los caracteres 
let characterSize = calcSize();

let intervalId;

let useColors = document.getElementById("dynamic-colors-input").checked;

export function setInputs() {
    document.getElementById("font-size-input").value = config.fontSize;
    document.getElementById("letter-spacing-input").value = config.letterSpacing;
    document.getElementById("line-height-input").value = config.lineHeight;

    const toHex = (c) => {
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.fillStyle = c;
        return ctx.fillStyle;
    }

    document.getElementById("background-color-input").value = toHex(colors.background);
    document.getElementById("chars-color-input").value = toHex(colors.font);

    activateDynamicColors();
}

// Las llamadas de inicialización se han movido a script.js


function calcSize() { //funcion que permite calcular el tamaño de los caracteres para el uso dentro del contenedor
    const characterDiv = document.createElement("span");
    characterDiv.textContent = "A";
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

    return { width, height };
}

function setAsciiContainerSize(asciiContainer, width, height) {
    asciiContainer.style.width = width + "px";
    asciiContainer.style.height = height + "px";
    asciiContainer.style.position = "static";
    return;
}

//se debe poder cambiar el estilo y recargar el frame con el nuevo estilo
export function changeStyle(styles) {
    // Config properties that affect layout/size
    const layoutConfig = ['letterSpacing', 'lineHeight', 'fontSize'];
    let layoutChanged = false;

    for (const key in styles) {
        if (layoutConfig.includes(key) && styles[key]) {
            config[key] = parseFloat(styles[key]);
            layoutChanged = true;
        } else if (key === 'backgroundColor') {
            colors.background = styles[key];
        } else if (key === 'charsColor') {
            colors.font = styles[key];
        } else if (key === 'charSet') {
            if (charSetIndex != styles[key]) {
                revertCharSet(false);
                charSetIndex = parseInt(styles[key]);
            }
        }
    }

    if (layoutChanged) {
        characterSize = calcSize(); //se recalculan los tamaños
    }

    // Si hay una imagen estática renderizada, la regeneramos para ver los cambios inmediatamente
    if (actualElement && actualElement.tagName === "IMG") {
        asciiFrame(actualElement, actualElementSize.width, actualElementSize.height);
    }
    // Si es video, el loop se encarga
    return;
}

export function revertCharSet(value) {
    if (value != charSetRevert) {
        chars[charSetIndex] = chars[charSetIndex].split("").reverse().join("");
        charSetRevert = value;
        // La actualización de la UI ahora es responsabilidad de script.js
        document.getElementById("revert-charset-input").checked = value;
    }
    return;
}

export function activateDynamicColors(value) {
    const CharactersColorInput = document.getElementById("chars-color-container");
    useColors = value;
    if (useColors) {
        CharactersColorInput.style.display = "none";
    } else {
        CharactersColorInput.style.display = "flex";
    }
    return;
}

function whiteBoard() {
    asciiContainer.innerHTML = "";
    asciiContainer.textContent = "";
    return;
}

export function cleanBoard() {
    if (intervalId) {
        clearInterval(intervalId);
    }
    whiteBoard();
    setAsciiContainerSize(asciiContainer, 0, 0);
    console.log("board Cleaned");
    return;
}

export function downloadFrame() {
    //verificamos que el elemento sea un video para hacer la conversion del frame en IMG
    if (actualElement.tagName == "VIDEO") {
        asciiCanva(actualElement, actualElementSize.width, actualElementSize.height, true);
    } else {
        asciiCanva(actualElement, actualElementSize.width, actualElementSize.height);
    }
}

async function asciiCanva(element, width, height, mirror = false) { //to-do: separar funcionalidades
    const elementCanva = document.createElement("canvas");
    const ctx = elementCanva.getContext("2d");
    elementCanva.width = width;
    elementCanva.height = height;

    if (mirror) {
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(element, 0, 0, width, height);
        ctx.restore();
    } else {
        ctx.drawImage(element, 0, 0, width, height); // se dibuja
    }

    const data = ctx.getImageData(0, 0, width, height).data;

    //se crea el elemento canva donde se pondra el arte asci
    // Usamos un multiplicador de escala para mejorar la resolución del texto
    const exportScale = 3;
    const asciiCanva = new OffscreenCanvas(width * exportScale, height * exportScale);

    const asciiCtx = asciiCanva.getContext("2d");

    //se pinta el canvas de blanco o el color seleccionado
    asciiCtx.fillStyle = colors.background;
    asciiCtx.fillRect(0, 0, width * exportScale, height * exportScale);
    asciiCtx.fillStyle = colors.font;
    asciiCtx.textBaseline = "top";

    asciiCtx.font = `${config.fontSize * exportScale}px monospace`

    const charSet = chars[charSetIndex];

    // cantidad de caracteres que caben
    const cols = Math.floor(width / characterSize.width);
    const rows = Math.floor(height / characterSize.height);

    // factores de escala (video px / caracter)
    const scaleX = width / cols;
    const scaleY = height / rows;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const px = Math.floor(x * scaleX);
            const py = Math.floor(y * scaleY);
            const pixelIndex = (py * width + px) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const lum = LUMINANCE_WEIGHTS.R * r + LUMINANCE_WEIGHTS.G * g + LUMINANCE_WEIGHTS.B * b;
            const index = Math.floor(lum / 255 * (charSet.length - 1));

            if (useColors) {
                asciiCtx.fillStyle = `rgb(${r},${g},${b})`;
            }

            asciiCtx.fillText(charSet[index], x * characterSize.width * exportScale, y * characterSize.height * exportScale);
        }
    }

    let src = await asciiCanva.convertToBlob().then(async blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        const getLink = new Promise((resolve) => {
            reader.onloadend = () => {
                resolve(reader.result);
            }
        });

        return await getLink;
    })

    console.log(src);


    var a = document.createElement('a');
    a.href = src;
    a.download = `${actualElementName}_Ascii.jpg`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

}

function asciiFrame(element, width, height, mirror = false) {
    if (mirror) {
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(element, 0, 0, width, height);
        ctx.restore();
    } else {
        ctx.drawImage(element, 0, 0, width, height); // se dibuja
    }

    const data = ctx.getImageData(0, 0, width, height).data; //se obtiene la informacion de los pixeles

    // tamaño del contenedor ASCII (CSS px)
    const asciiW = asciiContainer.getBoundingClientRect().width;
    const asciiH = asciiContainer.getBoundingClientRect().height;

    asciiContainer.style.backgroundColor = colors.background;

    if (!useColors) {
        asciiContainer.style.color = colors.font;
    }

    const charSet = chars[charSetIndex];


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
            const lum = LUMINANCE_WEIGHTS.R * r + LUMINANCE_WEIGHTS.G * g + LUMINANCE_WEIGHTS.B * b;
            const index = Math.floor(lum / 255 * (charSet.length - 1));
            let char = charSet[index];

            // Escapamos los caracteres que rompen el HTML
            if (char === " ") char = "&nbsp;";
            else if (char === "<") char = "&lt;";
            else if (char === ">") char = "&gt;";
            else if (char === "&") char = "&amp;";
            

            if (useColors) {
                const hex =
                    "#" +
                    r.toString(16).padStart(2, "0") +
                    g.toString(16).padStart(2, "0") +
                    b.toString(16).padStart(2, "0");


                ascii += `<span style="color:${hex}">${char}</span>`;
            } else {
                ascii += char;
            }
        }

        ascii += "<br/>";
    }

    asciiContainer.innerHTML = ascii;

    return;
}

async function getImageSize(image) {
    return new Promise((resolve) => {
        image.onload = () => {
            resolve({ width: image.width, height: image.height })
        }
    })
}

export async function asciiImage(file) {
    const reader = new FileReader();
    let url;

    await new Promise((resolve) => {
        reader.addEventListener("load", () => {
            console.log(reader);
            resolve(reader.result);
        });

        return reader.readAsDataURL(file)
    }).then((res) => {
        url = res;
    })

    let newImage = document.getElementById("img-container");
    newImage.setAttribute("src", url);

    let { width, height } = await getImageSize(newImage);

    const resized = calculateAspectRatioFit(width, height, MAX_WIDTH, MAX_HEIGHT);

    width = resized.width;
    height = resized.height;


    console.log(width, height);

    canvas.width = width;
    canvas.height = height;

    //el contenedor toma el tamaño de la imagen para posteriormente dentor de ascci frame segun los tamaños de los caracteres se escale
    setAsciiContainerSize(asciiContainer, width, height);

    const asciiW = asciiContainer.getBoundingClientRect().width;
    const asciiH = asciiContainer.getBoundingClientRect().height;

    console.log(asciiW, asciiH);

    actualElement = newImage;
    actualElementSize = resized;
    actualElementName = file.name;
    //esto sirve para generar la imagen del ascii art
    asciiFrame(newImage, width, height);
}

//we have to send the video to a canvas
export function asciiVideo(stream, front) {
    const videoElement = document.getElementById("video-container");

    videoElement.srcObject = stream;
    videoElement.play();
    videoElement.style = "display:none";

    //se obtiene la configuración de w,h del video
    const track = stream.getVideoTracks()[0];
    let { width, height } = track.getSettings();

    const resized = calculateAspectRatioFit(width, height, MAX_WIDTH, MAX_HEIGHT);
    width = resized.width;
    height = resized.height;

    console.log(resized);

    //se ajusta el canva para procesar el frame
    canvas.width = width;
    canvas.height = height;
    canvas.style = "display:none";

    //para camara se mantiene el ancho del componente padre

    asciiContainer.style.width = "100%";
    asciiContainer.style.height = "100%";
    asciiContainer.style.position = "absolute";
    asciiContainer.style.top = "0";
    asciiContainer.style.left = "0";

    console.log("entro");

    /*el recorte de la imagenn va a depender de: 
        -tamaño de la fuente
        -line-height
        -letter-spacing
        -tamaño disponible del elemento que contendra la imagen ascii
    */

    //como es un texto necesitamos actualizar continuamente nuestro contenedor
    actualElement = videoElement;
    actualElementSize = resized;
    actualElementName = "videoPic"

    intervalId = setInterval(() => {
        asciiFrame(videoElement, width, height, front);
    }, REFRESH_RATE_MS);
}
