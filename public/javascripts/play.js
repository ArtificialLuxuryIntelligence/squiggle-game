const canvas = document.getElementById("canvas");
const undo = document.getElementById("undo");
const restart = document.getElementById("restart");
const form = document.getElementById("submit-form");
const input = document.getElementById("hiddenField");
const input2 = document.getElementById("hiddenField2");
const ctx = canvas.getContext("2d");
const mouse = { x: 0, y: 0 };
let isDrawing = false;
let points = [];
let section = 0;
let squiggle;

//colour variable (from database)
let squiggleColour = "#36494E";
let strokeColour = "#9E2A2B";
let fillColour = "white";

//context styling
// canvas.width = window.innerWidth * 0.8;
// canvas.height = window.innerWidth * 0.8;
// ctx.filter = "blur(1px)";
ctx.imageSmoothingEnabled = true;

ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.lineJoin = "round";

//drawing mechanics

//line as user draws - (line is rerendered after mouseup)
function draw(e) {
  if (isDrawing) {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    if (points[section]) {
      points[section].push({ x: mouse.x, y: mouse.y });
    }
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
      ctx.closePath();
    }

    ctx.closePath();
  }
};

// Event Handlers
// function mousePos(e) {
//   mouse.x = e.clientX - this.offsetLeft;
//   mouse.y = e.clientY - this.offsetTop;
// }

// Handlers
function mousePos(e) {
  var rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}

const mouseDownHandler = () => {
  isDrawing = true;
  ctx.moveTo(mouse.x, mouse.y);
  ctx.beginPath();
  let arr = [];
  points.push(arr);

  setTimeout(() => {
    canvas.addEventListener("mousemove", draw);
    // draws first pixel before mouse moves take over drawing job
    ctx.fillStyle = strokeColour;
    ctx.fillRect(mouse.x, mouse.y, 1, 1);
    if (points[section]) {
      points[section].push({ x: mouse.x, y: mouse.y });
    }
  }, 500);
};

const mouseUpHandler = () => {
  {
    console.log("up");
    console.log("points " + points.length);
    console.log("section " + section);
    //if nothing was drawn (i.e. just a quick tap which does not draw with touch) -see touchDownHandler
    if (points[points.length - 1].length < 1) {
      // ctx.closePath();
      points.pop();
      if (section > 0) {
        section--;
      }
    }
    canvas.removeEventListener("mousemove", draw);
    //rerender drawing: (not needed unless fancy smoothing is done)
    // drawFromPoints(points);
    if (isDrawing) {
      section++;
    }
    isDrawing = false;
  }

  // // drawFromPoints(points);
  // canvas.removeEventListener("mousemove", draw);
  // if (isDrawing) {
  //   section++;
  // }
  // isDrawing = false;
};

const mouseOutHandler = () => {
  canvas.removeEventListener("mousemove", draw);
  if (isDrawing) {
    section++;
  }
  isDrawing = false;
};

const undoHandler = points => {
  points.pop();
  if (section > 0) {
    section--;
  }
  backgroundFill();
  drawFromPoints(squiggle, squiggleColour);
  drawFromPoints(points, strokeColour);
};

const resetCanvas = () => {
  backgroundFill();
  drawFromPoints(squiggle, squiggleColour);
  ctx.strokeStyle = strokeColour;
  section = 0;
  points = [];
};

//event listeners
canvas.addEventListener("mousedown", mouseDownHandler);
canvas.addEventListener("mouseup", mouseUpHandler);
canvas.addEventListener("mouseout", mouseOutHandler);
canvas.addEventListener("mousemove", e => mousePos(e));
undo.addEventListener("click", () => undoHandler(points));
restart.addEventListener("click", resetCanvas);

//submit completeSquiggle
form.addEventListener("submit", async () => {
  let dataURL = await canvas.toDataURL();
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
  drawFromPoints(squiggle, squiggleColour);
  let dataURL = await canvas.toDataURL();
  input2.value = dataURL;
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

function touchdraw() {
  if (isDrawing) {
    ctx.lineTo(touch.x, touch.y);
    ctx.stroke();
    if (points[section]) {
      points[section].push({ x: touch.x, y: touch.y });
    }
  }
}

const touchDownHandler = e => {
  console.log("down");
  console.log("points " + points.length);
  console.log("section " + section);

  // draws first pixel before mouse moves take over drawing job
  // -----------a single quick tap doesnt work with touch for some reason
  //se touchUpHandler below
  // ctx.fillStyle = strokeColour;
  // ctx.fillRect(touch.x, touch.y, 1, 1);
  // points[section].push({ x: touch.x, y: touch.y });

  //50ms delay in drawing after touch so that multitouch pinch zoom doesn't draw on canvas
  setTimeout(() => {
    if (e.touches.length < 2) {
      let arr = [];
      points.push(arr);
      ctx.moveTo(touch.x, touch.y);
      ctx.beginPath();
      isDrawing = true;
      canvas.addEventListener("touchmove", touchdraw, { passive: false });
    } else {
      isDrawing = false;
      //assuming 2 touches here...
      // multitouchTracker = 2;
    }
  }, 50);
};

//tracker to see if there was recently a multitouch(i.e. zoom). If there was, then normal touchend should not fillRect---
let multitouchTracker;

///------

const touchUpHandler = e => {
  // if (multitouchTracker > 0) {
  //   multitouchTracker--;
  //   return;
  // }
  console.log("up");
  console.log("points " + points.length);
  console.log("section " + section);

  canvas.removeEventListener("touchmove", touchdraw, { passive: false });
  ctx.closePath();

  //if nothing was drawn (i.e. just a quick tap which does not draw with touch) -see touchDownHandler
  if (points[points.length - 1].length < 1) {
    // ctx.closePath();
    points.pop();
    if (section > 0) {
      section--;
    }
  }
  //rerender drawing: (not needed unless fancy smoothing is done)
  // drawFromPoints(points);
  if (isDrawing) {
    section++;
  }
  isDrawing = false;
};

canvas.addEventListener("touchstart", e => touchDownHandler(e), {
  passive: false
});
canvas.addEventListener("touchend", touchUpHandler);
// canvas.addEventListener("mouseout", mouseOutHandler);
canvas.addEventListener("touchmove", e => touchPos(e), { passive: false });

//
// Prevent scrolling when touching the canvas
// document.body.addEventListener(
//   "touchstart",
//   function(e) {
//     if (e.target == canvas && e.touches.length < 2) {
//       e.preventDefault();
//     }
//   },
//   { passive: false }
// );
// document.body.addEventListener(
//   "touchend",
//   function(e) {
//     if (e.target == canvas && e.touches.length < 2) {
//       e.preventDefault();
//     }
//   },
//   { passive: false }
// );
document.body.addEventListener(
  "touchmove",
  function(e) {
    if (e.target == canvas && e.touches.length < 2) {
      e.preventDefault();
    }
  },
  { passive: false }
);

///
// ZOOM magnifying glass {inspiration: https://jsfiddle.net/powerc9000/G39W9/}

const zoom = document.getElementById("zoom");
const zoomCtx = zoom.getContext("2d");
const zoomToggle = document.getElementById("zoomtoggle");

zoomToggle.addEventListener("click", () => {
  if (zoomToggle.classList.contains("zoom-on")) {
    zoomToggle.classList.remove("zoom-on");
    canvas.removeEventListener("mousemove", mouseMoveZoomHandler);
    canvas.removeEventListener("mouseout", mouseOutZoomHandler);
    canvas.removeEventListener("touchmove", touchMoveZoomHandler);
    // canvas.removeEventListener("touchend", touchEndZoomHandler);
  } else {
    zoomToggle.classList.add("zoom-on");
    canvas.addEventListener("mousemove", mouseMoveZoomHandler);
    canvas.addEventListener("mouseout", mouseOutZoomHandler);
    canvas.addEventListener("touchmove", touchMoveZoomHandler);
    canvas.addEventListener("touchend", touchEndZoomHandler);
  }
});

//Event Handlers
const mouseMoveZoomHandler = function(e) {
  // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  zoomCtx.drawImage(
    canvas,
    mouse.x - 12.5,
    mouse.y - 12.5,
    25,
    25,
    0,
    0,
    150,
    150
  );
  zoom.style.top = e.pageY + 10 + "px";
  zoom.style.left = e.pageX + 10 + "px";
  zoom.style.display = "block";
};
function mouseOutZoomHandler() {
  zoom.style.display = "none";
}
const touchMoveZoomHandler = function(e) {
  // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  zoomCtx.drawImage(
    canvas,
    touch.x - 12.5,
    touch.y - 12.5,
    25,
    25,
    0,
    0,
    150,
    150
  );
  var rect = canvas.getBoundingClientRect();

  zoom.style.top = rect.bottom + "px";
  zoom.style.left = rect.left + 75 + "px";
  zoom.style.display = "block";
};
function touchEndZoomHandler() {
  setTimeout(() => (zoom.style.display = "none"), 1000);
}

// canvas.style.transform = "scale(2,2)";
