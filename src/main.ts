import "./style.css";

const buttonSalvar = document.getElementById(
  "button-salvar"
)! as HTMLButtonElement;
const canvasInput = document.getElementById("input")! as HTMLCanvasElement;
const canvasOutput = document.getElementById("output")! as HTMLCanvasElement;
const inputImgZoom = document.getElementById(
  "input-img-zoom"
)! as HTMLInputElement;
const inputPreviewZoom = document.getElementById(
  "input-preview-zoom"
)! as HTMLInputElement;
const inputFile = document.getElementById("input-file")! as HTMLInputElement;
const inputOffsetX = document.getElementById(
  "input-offset-x"
)! as HTMLInputElement;
const inputOffsetY = document.getElementById(
  "input-offset-y"
)! as HTMLInputElement;
const inputSizeX = document.getElementById("input-size-x")! as HTMLInputElement;
const inputSizeY = document.getElementById("input-size-y")! as HTMLInputElement;
const inputResolutionX = document.getElementById(
  "input-resolution-x"
)! as HTMLInputElement;
const inputResolutionY = document.getElementById(
  "input-resolution-y"
)! as HTMLInputElement;
const contextInput = canvasInput.getContext("2d")!;
const contextOutput = canvasOutput.getContext("2d")!;

let currentFile: HTMLImageElement | null = null;
inputFile.addEventListener("change", () => {
  if (inputFile.files) {
    let file = inputFile.files[0];
    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.alt = image.title = file.name;
    currentFile = image;
    image.onload = () => {
      onChangeParameters();
    };
  }
});

for (let el of [
  inputOffsetX,
  inputOffsetY,
  inputSizeX,
  inputSizeY,
  inputResolutionX,
  inputResolutionY,
]) {
  el.addEventListener("change", () => {
    onChangeParameters();
  });
}
function onChangeParameters() {
  const offsetX = parseInt(inputOffsetX.value);
  const offsetY = parseInt(inputOffsetY.value);
  const sizeX = parseInt(inputSizeX.value);
  const sizeY = parseInt(inputSizeY.value);
  const resolutionX = parseInt(inputResolutionX.value);
  const resolutionY = parseInt(inputResolutionY.value);

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
    currentFile.height
  );
  for (let x = 0; x < resolutionX; x++) {
    let cordsX = sizeX * x + offsetX;
    for (let y = 0; y < resolutionY; y++) {
      let cordsY = sizeY * y + offsetY;
      let outCord = (resolutionX * y + x) * 4;
      let pix = getPixel(cordsX, cordsY, imageData);
      for (let i = 0; i < pix.length; i++) {
        outImageData.data[outCord + i] = pix[i];
      }
      contextInput.fillStyle = "rgba(255, 255, 255, 0.6)";
      contextInput.fillRect(cordsX, cordsY, 3, 3);
      contextInput.fillStyle = "red";
      contextInput.fillRect(cordsX + 1, cordsY + 1, 1, 1);
    }
  }
  contextOutput.putImageData(outImageData, 0, 0);
  setInputWidth();
  setOutputWidth();
}

function getPixel(
  x: number,
  y: number,
  data: ImageData
): [number, number, number, number] {
  const getColorIndicesForCoord = (x: number, y: number, width: number) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3] as const;
  };
  const colorsIndex = getColorIndicesForCoord(x, y, data.width);
  return colorsIndex.map((c) => data.data[c]) as [
    number,
    number,
    number,
    number
  ];
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

buttonSalvar.addEventListener("click", () => {
  window.open(canvasOutput.toDataURL("img/png", 90), "_blank")?.focus();
});
