const canvas = document.getElementById("canvas");
const save = document.getElementById("save");
const restart = document.getElementById("restart");
const form = document.getElementById("submit-form");
const input = document.getElementById("hiddenField");
const ctx = canvas.getContext("2d");
const mouse = { x: 0, y: 0 };
let isDrawing = false;
let points = [];
let section = 0;

//colour variable (from database)
let squiggleColour = "#36494E";
let strokeColour = "#9E2A2B";
let fillColour = "white";

//context styling
canvas.width = 300;
canvas.height = 300;
// ctx.filter = "blur(1px)";
// ctx.imageSmoothingEnabled = true;

ctx.lineWidth = 2;
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
  var rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}

const resetCanvas = () => {
  backgroundFill();
  ctx.strokeStyle = strokeColour;
  section = 0;
  points = [];
};
const mouseDownHandler = () => {
  if (section <= 2) {
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
  } else {
    alert("maximum three sections per squiggle!");
  }
};
const mouseUpHandler = () => {
  drawFromPoints(points);
  canvas.removeEventListener("mousemove", draw);
  if (isDrawing) {
    section++;
  }
  isDrawing = false;
};

const mouseOutHandler = () => {
  canvas.removeEventListener("mousemove", draw);
  if (isDrawing) {
    section++;
    console.log(section);
  }
  isDrawing = false;
};

//event listeners
canvas.addEventListener("mousedown", mouseDownHandler);

canvas.addEventListener("mouseup", mouseUpHandler);

canvas.addEventListener("mouseout", mouseOutHandler);

restart.addEventListener("click", resetCanvas);
canvas.addEventListener("mousemove", mousePos);
form.addEventListener("submit", async () => {
  input.value = JSON.stringify(points);
});

/// render squiggle
window.addEventListener("load", () => {
  backgroundFill();
  ctx.strokeStyle = strokeColour;
});

////////////////////////////////////////////////// mobile touch controls

const touch = { x: 0, y: 0 };

// Handlers
// Get the position of touch on canvas
function touchPos(e) {
  var rect = canvas.getBoundingClientRect();
  touch.x = e.touches[0].clientX - rect.left;
  touch.y = e.touches[0].clientY - rect.top;
}

function touchdraw(e) {
  if (isDrawing) {
    ctx.lineTo(touch.x, touch.y);
    ctx.stroke();
    points[section].push({ x: touch.x, y: touch.y });
  }
}

const touchDownHandler = () => {
  isDrawing = true;
  ctx.moveTo(touch.x, touch.y);
  ctx.beginPath();
  let arr = [];
  points.push(arr);
  canvas.addEventListener("touchmove", touchdraw, { passive: false });

  // draws first pixel before mouse moves take over drawing job
  // ctx.fillStyle = strokeColour;
  // ctx.fillRect(touch.x, touch.y, 1, 1);
  // points[section].push({ x: touch.x, y: touch.y });
};

const touchUpHandler = () => {
  drawFromPoints(points);
  canvas.removeEventListener("touchmove", touchdraw, { passive: false });
  if (isDrawing) {
    section++;
  }
  isDrawing = false;
};

// const mouseOutHandler = () => {
//   canvas.removeEventListener("mousemove", draw);
//   if (isDrawing) {
//     section++;
//     console.log(section);
//   }
//   isDrawing = false;
// };

//event listeners

//
// removed from inside touchstart and end handlers:
// canvas.addEventListener("touchmove", touchdraw);
//
canvas.addEventListener("touchstart", touchDownHandler, { passive: false });
canvas.addEventListener("touchend", touchUpHandler);
// canvas.addEventListener("mouseout", mouseOutHandler);
canvas.addEventListener("touchmove", e => touchPos(e), { passive: false });

//
// Prevent scrolling when touching the canvas
document.body.addEventListener(
  "touchstart",
  function(e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  },
  { passive: false }
);
document.body.addEventListener(
  "touchend",
  function(e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  },
  { passive: false }
);
document.body.addEventListener(
  "touchmove",
  function(e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  },
  { passive: false }
);
