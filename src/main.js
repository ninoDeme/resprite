const buttonSalvar = document.getElementById("button-salvar");
/** @type HTMLCanvasElement */
const canvasInput = document.getElementById("input");
/** @type HTMLCanvasElement */
const canvasOutput = document.getElementById("output");
/** @type HTMLInputElement */
const inputImgZoom = document.getElementById("input-img-zoom");
/** @type HTMLInputElement */
const inputPreviewZoom = document.getElementById("input-preview-zoom");
/** @type HTMLInputElement */
const inputFile = document.getElementById("input-file");
/** @type HTMLInputElement */
const inputOffsetX = document.getElementById("input-offset-x");
/** @type HTMLInputElement */
const inputOffsetY = document.getElementById("input-offset-y");
/** @type HTMLInputElement */
const inputSizeX = document.getElementById("input-size-x");
/** @type HTMLInputElement */
const inputSizeY = document.getElementById("input-size-y");
/** @type HTMLInputElement */
const inputResolutionX = document.getElementById("input-resolution-x");
/** @type HTMLInputElement */
const inputResolutionY = document.getElementById("input-resolution-y");
/** @type HTMLInputElement */
const checkGrid = document.getElementById("checkbox-grid");
const contextInput = canvasInput.getContext("2d");
const contextOutput = canvasOutput.getContext("2d");

/** @type HTMLImageElement */
let currentFile = null;

inputFile.addEventListener("change", () => {
  loadImg();
});
function loadImg() {
  if (inputFile.files[0]) {
    if (outputImageAnchor) {
      outputImageAnchor.remove();
      outputImageAnchor = null;
    }
    let file = inputFile.files[0];
    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.alt = image.title = file.name;
    image.onload = () => {
      currentFile = image;
      onChangeParameters();
    };
  }
}
for (let el of [
  inputOffsetX,
  inputOffsetY,
  inputSizeX,
  inputSizeY,
  inputResolutionX,
  inputResolutionY,
  checkGrid,
]) {
  el.addEventListener("change", () => {
    onChangeParameters();
  });
}

function onChangeParameters() {
  const offsetX = parseFloat(inputOffsetX.value);
  const offsetY = parseFloat(inputOffsetY.value);
  const sizeX = parseFloat(inputSizeX.value);
  const sizeY = parseFloat(inputSizeY.value);
  const resolutionX = parseInt(inputResolutionX.value);
  const resolutionY = parseInt(inputResolutionY.value);
  const showGrid = !!checkGrid.checked;
  if (!currentFile) return;
  canvasInput.width = currentFile.width;
  canvasInput.height = currentFile.height;
  contextInput.clearRect(0, 0, currentFile.width, currentFile.height);
  contextInput.drawImage(currentFile, 0, 0);
  canvasOutput.width = resolutionX;
  canvasOutput.height = resolutionY;
  let outImageData = contextOutput.createImageData(resolutionX, resolutionY);
  const imageData = contextInput.getImageData(
    0,
    0,
    currentFile.width,
    currentFile.height,
  );
  for (let x = 0; x < resolutionX; x++) {
    let cordsX = Math.round(sizeX * x + offsetX);
    for (let y = 0; y < resolutionY; y++) {
      let cordsY = Math.round(sizeY * y + offsetY);
      let outCord = (resolutionX * y + x) * 4;
      let pix = getPixel(cordsX, cordsY, imageData);
      for (let i = 0; i < pix.length; i++) {
        outImageData.data[outCord + i] = pix[i];
      }
      contextInput.fillStyle = "rgb(255, 255, 255)";
      contextInput.globalAlpha = 0.3;
      contextInput.fillRect(cordsX, cordsY, 3, 3);
      contextInput.fillStyle = "red";
      contextInput.globalAlpha = 1;
      contextInput.fillRect(cordsX + 1, cordsY + 1, 1, 1);
    }
  }
  if (showGrid) {
    contextInput.beginPath();
    function getGridCord(size, offset, i = 0) {
      return size * i + offset - size / 2;
    }
    for (let x = 0; x <= resolutionX; x++) {
      let cords = getGridCord(sizeX, offsetX, x) + 1.5;
      contextInput.moveTo(cords, Math.floor(getGridCord(sizeY, offsetY)) + 1);
      contextInput.lineTo(
        cords,
        Math.ceil(getGridCord(sizeY, offsetY, resolutionY)) + 1,
      );
    }
    for (let y = 0; y <= resolutionY; y++) {
      let cords = getGridCord(sizeY, offsetY, y) + 1.5;
      contextInput.moveTo(Math.floor(getGridCord(sizeX, offsetX)) + 1, cords);
      contextInput.lineTo(
        Math.ceil(getGridCord(sizeX, offsetX, resolutionX)) + 1,
        cords,
      );
    }
    contextInput.strokeStyle = "rgb(150, 150, 150)";
    contextInput.stroke();
  }
  contextOutput.putImageData(outImageData, 0, 0);
  setInputWidth();
  setOutputWidth();
}

function getPixel(x, y, data) {
  const getColorIndicesForCoord = (x, y, width) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  };
  const colorsIndex = getColorIndicesForCoord(x, y, data.width);
  return colorsIndex.map((c) => data.data[c]);
}

function setInputWidth() {
  if (!currentFile) return;
  const resolutionX = currentFile.width;
  canvasInput.style.width = parseInt(inputImgZoom.value) * resolutionX + "px";
}

inputImgZoom.addEventListener("change", () => {
  setInputWidth();
});

function setOutputWidth() {
  const resolutionX = parseInt(inputResolutionX.value);
  canvasOutput.style.width =
    parseInt(inputPreviewZoom.value) * resolutionX + "px";
}

inputPreviewZoom.addEventListener("change", () => {
  setOutputWidth();
});

let lastUrl = null;
/** @type HTMLAnchorElement */
let outputImageAnchor = null;
buttonSalvar.addEventListener("click", () => {
  canvasOutput.toBlob(
    (blob) => {
      if (blob == null) {
        console.error("Não foi possível criar a imagem");
      }
      if (lastUrl != null) {
        URL.revokeObjectURL(lastUrl);
      }
      lastUrl = URL.createObjectURL(blob);
      if (!outputImageAnchor) {
        const newEl = document.createElement("a");
        newEl.innerText =
          "If the download doesn't start automatically, click here";
        outputImageAnchor = document
          .getElementById("link-container")
          .appendChild(newEl);
      }
      console.log(currentFile);
      outputImageAnchor.download = (currentFile.alt || "input").replace(
        /(\.[^.]+)?$/,
        "_resprite.png",
      );
      outputImageAnchor.href = lastUrl;
      outputImageAnchor.click();
    },
    "img/png",
    1,
  );
});
loadImg();
