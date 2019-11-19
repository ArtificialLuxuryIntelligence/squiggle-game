const canvas = document.getElementById("canvas");
const undo = document.getElementById("undo");
const restart = document.getElementById("restart");
const form = document.getElementById("submit-form");
const input = document.getElementById("hiddenField");

const ctx = canvas.getContext("2d");
const mouse = { x: 0, y: 0 };
let isDrawing = false;
let points = [];
let section = 0;
let squiggle;

//colour variable (from database)
let squiggleColour = "#fff000";
let strokeColour = "red";
let fillColour = "grey";

//context styling
canvas.width = 300;
canvas.height = 300;
// ctx.filter = "blur(1px)";
ctx.imageSmoothingEnabled = true;

ctx.lineWidth = 1;
ctx.lineCap = "round";
ctx.lineJoin = "round";

//drawing mechanics

//line as user draws - (line is rerendered after mouseup)
function draw(e) {
  if (isDrawing) {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    points[section].push({ x: mouse.x, y: mouse.y });
  }
}

const backgroundFill = () => {
  ctx.fillStyle = fillColour;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
};

const drawFromPoints = (collection, strokecolour) => {
  ctx.strokeStyle = strokecolour;
  for (let i = 0; i < collection.length; i++) {
    ctx.moveTo(collection[i][0].x, collection[i][0].y);
    ctx.beginPath();
    for (let j = 0; j < collection[i].length; j++) {
      // linear;
      ctx.lineTo(collection[i][j].x, collection[i][j].y);

      // // //quadratic line for smoothing [ note: loop to collection[i].length-2]
      // let a = collection[i][j + 1].x;
      // let b = collection[i][j + 1].y;
      // //
      // // let a = (collection[i][j].x + collection[i][j + 1].x) / 2;
      // // let b = (collection[i][j].y + collection[i][j + 1].y) / 2;
      // ctx.quadraticCurveTo(
      //   a,
      //   b,
      //   collection[i][j + 2].x,
      //   collection[i][j + 2].y
      // );
      ctx.moveTo(collection[i][j].x, collection[i][j].y);

      ctx.stroke();
    }

    ctx.closePath();
  }
};

// Event Handlers
function mousePos(e) {
  mouse.x = e.clientX - this.offsetLeft;
  mouse.y = e.clientY - this.offsetTop;
}

const resetCanvas = () => {
  backgroundFill();
  drawFromPoints(squiggle, squiggleColour);
  ctx.strokeStyle = strokeColour;
  section = 0;
  points = [];
};

const mouseDownHandler = () => {
  isDrawing = true;
  ctx.moveTo(mouse.x, mouse.y);
  ctx.beginPath();
  let arr = [];
  points.push(arr);
  canvas.addEventListener("mousemove", draw);

  // draws first pixel before mouse moves take over drawing job
  ctx.fillStyle = strokeColour;
  ctx.fillRect(mouse.x, mouse.y, 1, 1);
  points[section].push({ x: mouse.x, y: mouse.y });
};

const undoHandler = points => {
  points.pop();
  if (section > 0) {
    section--;
    console.log(section);
  }
  backgroundFill();
  drawFromPoints(squiggle, squiggleColour);
  drawFromPoints(points, strokeColour);
};

//event listeners
canvas.addEventListener("mousedown", mouseDownHandler);

canvas.addEventListener("mouseup", () => {
  drawFromPoints(points);
  canvas.removeEventListener("mousemove", draw);
  if (isDrawing) {
    section++;
  }
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  canvas.removeEventListener("mousemove", draw);
  if (isDrawing) {
    section++;
    console.log(section);
  }
  isDrawing = false;
});

undo.addEventListener("click", () => undoHandler(points));
restart.addEventListener("click", resetCanvas);
canvas.addEventListener("mousemove", mousePos);

//submit completeSquiggle
form.addEventListener("submit", async () => {
  var dataURL = await canvas.toDataURL();
  console.log(dataURL);
  input.value = dataURL;
  // let data = await JSON.stringify(points);
  // console.log(data);
  // input.value = JSON.stringify(points);
});

//fetch squiggle
const fetchSquiggle = async () => {
  const response = await fetch("/play/squiggle");
  const json = await response.json();
  return JSON.parse(json.line);
};

/// render squiggle
window.addEventListener("load", async () => {
  backgroundFill();
  squiggle = await fetchSquiggle();
  console.log(squiggle);
  drawFromPoints(squiggle, squiggleColour);
  ctx.strokeStyle = strokeColour;
});
