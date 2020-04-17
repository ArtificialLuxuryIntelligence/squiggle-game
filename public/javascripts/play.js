//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// CONTENTS
// colour;
// canvas scaling;
// canvas drawing;
//   touch
//   mouse
// button handlers
// fetch;
// animate;
// event listeners
// on window load

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const body = document.body;
//drawing canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
//circle overlay canvas
const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

const undo = document.getElementById("undo");
const rotate = document.getElementById("rotate");
const form = document.getElementById("submit-form");
const input = document.getElementById("hiddenField");
const input2 = document.getElementById("hiddenField2");
const input3 = document.getElementById("hiddenField3");
const IDinput = document.getElementById("idinput");
const buttons = document.querySelectorAll(".button");

const mouse = { x: 0, y: 0 };
const touch = { x: null, y: null };
let isDrawing = false;
let points = [];
let squiggle;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//COLOUR
let squiggleColour, strokeColour;

const colours = [
  { sqCol: "red", stCol: ["orange", "yellow"] },
  { sqCol: "blue", stCol: ["pink", "purple"] },
  { sqCol: "green", stCol: ["blue", "turquoise"] },
];

const generateColourScheme = function (arr) {
  let obj = arr[Math.floor(Math.random() * arr.length)];
  squiggleColour = obj.sqCol;
  let rand = Math.floor(obj.stCol.length * Math.random());
  strokeColour = obj.stCol[rand];
};

let fillColour = "white";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//SCALING
// for better resolution and scaling canvas for devices of different sizes

//(canvas2 is for circle overlay)

const maxWidth = 600;

const cwidth = window.innerWidth < maxWidth ? window.innerWidth : maxWidth; //max canvas width 600px in brower
const cheight = window.innerHeight;

canvas.style.width = cwidth + "px";
canvas.style.height = cwidth + "px";
canvas2.style.width = cwidth + "px";
canvas2.style.height = cwidth + "px";

//adjust for dpi
const size = cwidth * window.devicePixelRatio;
// const size = 1800;

canvas.width = size;
canvas.height = size;
canvas2.width = size;
canvas2.height = size;

//normalises canvas/device width ratio
let scaleFactor1 = size / cwidth;
ctx.scale(scaleFactor1, scaleFactor1);
ctx2.scale(scaleFactor1, scaleFactor1);

///diminensions of original device that created squiggle (fetched)
let originalSize;
let scaleFactor;

//the canvas is rescaled when squiggle points (from any device width) are loaded

//test so that functions don't run twice  (don't compound)
let scaling = { renderScaling: true };

//for rendering squiggle
const renderScaling = () => {
  // console.log(`render scaling called`);
  ctx.scale(scaleFactor, scaleFactor);
  ctx2.scale(scaleFactor, scaleFactor);

  ctx.lineWidth = originalSize / 60;
  ctx2.lineWidth = originalSize / 300;

  scaling.renderScaling = true;
  // console.log(`render scaling run`);
};

//inverses renderscaling
const drawScaling = () => {
  let invScaleFactor = 1 / scaleFactor;
  ctx.scale(invScaleFactor, invScaleFactor);
  ctx2.scale(invScaleFactor, invScaleFactor);

  ctx.lineWidth = cwidth / 60;
  ctx2.lineWidth = cwidth / 300;

  scaling.renderScaling = false;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//DRAWING mechanics
//variable to hold user line drawing (animation)
let drawAnim;

//smoothing radius
const chain = 4;

ctx.lineCap = "round";
ctx.lineJoin = "round";
// ctx.imageSmoothingEnabled = true;

//helper
function midPointOf(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
}

const backgroundFill = () => {
  ctx.fillStyle = fillColour;
  ctx.fillRect(0, 0, cwidth, cwidth);
};

// draw from array of array of points
const drawFromPoints = (collection, strokecolour) => {
  ctx.strokeStyle = strokecolour;
  for (let i = 0; i < collection.length; i++) {
    // ctx.moveTo(collection[i][0].x, collection[i][0].y);
    ctx.beginPath();
    for (let j = 0; j < collection[i].length - 1; j++) {
      // linear;
      // ctx.lineTo(collection[i][j].x, collection[i][j].y);

      //quadratic:
      const midPoint = midPointOf(collection[i][j], collection[i][j + 1]);
      ctx.quadraticCurveTo(
        collection[i][j].x,
        collection[i][j].y,
        midPoint.x,
        midPoint.y
      );
    }
    //straight line to last pt.
    ctx.lineTo(
      collection[i][collection[i].length],
      collection[i][collection[i].length]
    );

    ctx.stroke();
    ctx.closePath();
  }
};

const drawLoop = () => {
  // console.log(points);
  //simple drawing here so probably not too bad to rerender the whole image each frame
  rerender();
  drawAnim = requestAnimationFrame(drawLoop);
};

//drawing from points uses stroke once per complete line => smoother
const rerender = () => {
  ctx.clearRect(0, 0, cwidth, cheight);
  backgroundFill();
  renderScaling();
  if (squiggle) {
    drawFromPoints(squiggle, squiggleColour);
  }
  drawScaling();
  drawFromPoints(points, strokeColour);
};

// TOUCH drawing

// Get the position of touch on canvas
function touchPos(e) {
  var rect = canvas.getBoundingClientRect();

  switch ((turns % 4) + 1) {
    case 1:
      touch.x = e.touches[0].clientX - rect.left;
      touch.y = e.touches[0].clientY - rect.top;
      return;
    case 2:
      touch.x = e.touches[0].clientY - rect.top;
      touch.y = -e.touches[0].clientX + rect.right;
      return;
    case 3:
      touch.x = rect.right - e.touches[0].clientX;
      touch.y = rect.bottom - e.touches[0].clientY;
      return;
    case 4:
      touch.x = rect.bottom - e.touches[0].clientY;
      touch.y = -rect.left + e.touches[0].clientX;
      return;
    default:
      null;
  }
}

//  -------------------- TOUCH Handlers

const touchDownHandler = (e) => {
  canvas.addEventListener("touchmove", touchMoveHandler, {
    passive: false,
  });
  drawAnim = requestAnimationFrame(drawLoop);

  //50ms delay in drawing after touch so that multitouch pinch zoom doesn't draw on canvas
  setTimeout(() => {
    if (e.touches.length === 1) {
      isDrawing = true;

      // ctx.closePath();
      //creates new section of drawing
      let arr = [];
      points.push(arr);
      ctx.strokeStyle = strokeColour;

      ctx.moveTo(touch.x, touch.y); // move this outside of timeout? (to avoid x:0, y:0 issue in animation frame)
      ctx.beginPath();
    } else {
      // console.log("ended drawing");

      isDrawing = false;
      canvas.removeEventListener("touchmove", touchMoveHandler, {
        passive: false,
      });
    }
  }, 50);
};

const touchMoveHandler = (e) => {
  if (isDrawing) {
    let lastArray = points.slice(-1)[0];

    if (lastArray.length == 0) {
      lastArray.push({ x: touch.x, y: touch.y });
    } else {
      let x1 = lastArray.slice(-1)[0].x;
      let y1 = lastArray.slice(-1)[0].y;
      let x2 = touch.x;
      let y2 = touch.y;

      //disatnce between points
      let dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      //angle between drawFromPoints
      let alpha = Math.atan2(x2 - x1, y2 - y1);

      if (dist < chain) {
      }
      if (dist >= chain) {
        //add a new point in the direction of the mouse pointer
        let x = (dist - chain) * Math.sin(alpha) + x1;
        let y = (dist - chain) * Math.cos(alpha) + y1;

        lastArray.push({ x, y });
      }
    }
  }
};

const touchUpHandler = (e) => {
  if (isDrawing) {
    // ctx.closePath();

    // canvas.removeEventListener("touchmove", touchdraw, { passive: false });
    // canvas.removeEventListener("touchmove", drawingLoop, { passive: false });

    //if nothing was drawn (i.e. just a quick tap which does not draw with touch) -see touchDownHandler
    if (points[points.length - 1].length === 0) {
      // ctx.closePath();
      points.pop();
      // if (section > 0) {
      //   section--;
      // }
    }

    isDrawing = false;
    rerender();
  }
  // console.log("cancel anim ");

  cancelAnimationFrame(drawAnim);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// MOUSE drawing

function mousePos(e) {
  var rect = canvas.getBoundingClientRect();

  switch ((turns % 4) + 1) {
    case 1:
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      return;
    case 2:
      mouse.x = e.clientY - rect.top;
      mouse.y = -e.clientX + rect.right;
      return;
    case 3:
      mouse.x = rect.right - e.clientX;
      mouse.y = rect.bottom - e.clientY;
      return;
    case 4:
      mouse.x = rect.bottom - e.clientY;
      mouse.y = -rect.left + e.clientX;
      return;
    default:
      null;
  }
}

//  -------------------- MOUSE  Handlers

//////////////////////////////

const mouseDownHandler = () => {
  canvas.addEventListener("mousemove", mouseMoveHandler);
  drawAnim = requestAnimationFrame(drawLoop);

  ctx.strokeStyle = strokeColour;
  ctx.fillStyle = strokeColour;
  // ctx.closePath();
  points.push([]);
  ctx.moveTo(mouse.x, mouse.y);
  ctx.beginPath();
  isDrawing = true;

  // canvas.addEventListener("mousemove", draw);

  // const drawingLoop = () => {
  //   draw();
  //   drawAnim = requestAnimationFrame(drawingLoop);
  // };
  // requestAnimationFrame(drawingLoop);

  // draws first pixel before mouse moves take over drawing job
  //needs to be with of stroke width , not 1
  // ctx.fillRect(mouse.x, mouse.y, 1, 1);
  // if (points[section]) {
  //   points[section].push({ x: mouse.x, y: mouse.y });
  // }
};

const mouseMoveHandler = () => {
  //shouldnt need this check
  if (isDrawing) {
    let lastArray = points.slice(-1)[0];

    if (lastArray.length == 0) {
      lastArray.push({ x: mouse.x, y: mouse.y });
    } else {
      //smoothing radius (chain) set globally
      //x1 is last point in lastArray (of points)
      let x1 = lastArray.slice(-1)[0].x;
      let y1 = lastArray.slice(-1)[0].y;
      let x2 = mouse.x;
      let y2 = mouse.y;

      //disatnce between points
      let dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      //angle between drawFromPoints
      let alpha = Math.atan2(x2 - x1, y2 - y1);

      if (dist < chain) {
        //do nothing (distance is too short)
      }
      if (dist >= chain) {
        //draw a new point in the direction of the mouse pointer
        let x = (dist - chain) * Math.sin(alpha) + x1;
        let y = (dist - chain) * Math.cos(alpha) + y1;

        lastArray.push({ x: x, y: y });
      }
    }
  }
};

const mouseUpHandler = () => {
  canvas.removeEventListener("mousemove", mouseMoveHandler);
  cancelAnimationFrame(drawAnim);

  if (isDrawing) {
    ctx2.clearRect(0, 0, cwidth, cheight);
    // ctx.closePath();
    isDrawing = false;
    //remove any point arrays with no content (a quick click or touch doesn't draw anything)
    points = points.filter((arr) => arr.length !== 0);
    rerender();
  }
};

const mouseOutHandler = () => {
  canvas.removeEventListener("mousemove", mouseMoveHandler);
  cancelAnimationFrame(drawAnim);
  isDrawing = false;
};

//  --------------------  GENERAL button handlers

const undoHandler = (points) => {
  points.pop();

  // ctx.clearRect(0, 0, cwidth, cheight);
  // backgroundFill();
  // renderScaling();
  // drawFromPoints(squiggle, squiggleColour);
  // drawScaling();
  // drawFromPoints(points, strokeColour);

  rerender();
};

let turns = 0;
const rotateCanvas = async () => {
  turns++;
  // console.log((turns % 4) + 1);

  ctx.clearRect(0, 0, cwidth, cwidth);
  backgroundFill();

  //rotate canvas and rerender
  ctx.translate(cwidth / 2, cwidth / 2); //both cwidth (is a square)
  ctx.rotate(Math.PI / 2);
  ctx.translate(-cwidth / 2, -cwidth / 2);

  ctx2.translate(cwidth / 2, cwidth / 2);
  ctx2.rotate(Math.PI / 2);
  ctx2.translate(-cwidth / 2, -cwidth / 2);

  // same as rerender function: (with save)
  renderScaling();
  drawFromPoints(squiggle, squiggleColour);
  drawScaling();
  ctx.strokeStyle = strokeColour;
  let dataURL = await canvas.toDataURL(); //saves newly rotated squiggle
  input2.value = dataURL;
  drawFromPoints(points, strokeColour);
  isDrawing = false;
  //
};

//
// Prevent scrolling when touching the canvas
// canvas.addEventListener(
//   "touchstart",
//   function(e) {
//     if (e.touches.length < 2) {
//       e.preventDefault();
//     }
//   },
//   { passive: false }
// );
// canvas.addEventListener(
//   "touchend",
//   function(e) {
//     if (e.touches.length < 2) {
//       e.preventDefault();
//     }
//   },
//   { passive: false }
// );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FETCH squiggle
const fetchSquiggle = async () => {
  const response = await fetch("/play/squiggle");
  const json = await response.json();

  return json;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ANIMATE canvas
const animateSquiggle = () => {
  renderScaling();
  console.log("animating...");
  // clear the canvas
  ctx.strokeStyle = squiggleColour;

  // start the animation
  let p = 0;
  let i = 0;
  // ctx.beginPath();
  animate();

  function animate() {
    if (squiggle[i] && p < squiggle[i].length) {
      //draw point by point
      let s = squiggle.slice(0, i + 1);
      let pop = s.pop();
      s.push(pop.slice(0, p + 1));
      drawFromPoints(s, squiggleColour);
      p++;

      requestAnimationFrame(animate);
      //increments i in order to move to next section of squiggle
    } else if (i < squiggle.length) {
      setTimeout(() => {
        i++;
        p = 0;
        requestAnimationFrame(animate);
      }, 300);
    }
    if (i == squiggle.length) {
      console.log("...animation complete");
      addListeners("play");
      drawScaling();
      rerender();

      return;
    }

    // ctx.beginPath();
    // ctx.moveTo(squiggle[i][p - 1].x, squiggle[i][p - 1].y);
    // ctx.lineTo(squiggle[i][p].x, squiggle[i][p].y);
    // ctx.stroke();
    // p++;
  }
};

//////////////////////////////
// circle at cursor/touch - helps with UI of smoothing radius (chain)
const drawCircle = (lastArray, pointer) => {
  let lastPoint = lastArray.slice(-1)[0];
  // console.log(lastPoint);

  ctx2.clearRect(0, 0, cwidth, cheight);

  if (lastArray.length == 0) {
    return;
  }
  ctx2.beginPath();

  ctx2.arc(pointer.x, pointer.y, chain, 0, 2 * Math.PI);

  ctx2.fillRect(lastPoint.x, lastPoint.y, 1, 1);
  ctx2.stroke();

  ctx2.closePath();
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// EVENT LISTENERS

const addListeners = (path) => {
  buttons.forEach((button) => button.classList.remove("disabled"));

  if (
    "ontouchstart" in window ||
    navigator.MaxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  ) {
    undo.addEventListener("touchstart", () => undoHandler(points));
    canvas.addEventListener("touchstart", touchDownHandler, {
      passive: false,
    });
    window.addEventListener("touchend", touchUpHandler);
    canvas.addEventListener("touchmove", (e) => touchPos(e), {
      passive: false,
    });
    canvas.addEventListener(
      "touchmove",
      function (e) {
        if (e.touches.length < 2) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  } else {
    undo.addEventListener("click", () => undoHandler(points));
    canvas.addEventListener("mousedown", mouseDownHandler);
    canvas.addEventListener("mouseup", mouseUpHandler);
    canvas.addEventListener("mousemove", (e) => mousePos(e));
    canvas.addEventListener("mouseout", mouseOutHandler);
  }

  // undo.addEventListener("click", () => undoHandler(points));

  // ---------------- page specific listeners
  if (path === "play") {
    if (
      "ontouchstart" in window ||
      navigator.MaxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    ) {
      rotate.addEventListener("touchstart", rotateCanvas);
    } else {
      rotate.addEventListener("click", rotateCanvas);
    }

    form.addEventListener("submit", async (e) => {
      // e.preventDefault();
      let dataURL = await canvas.toDataURL();
      input.value = dataURL;

      // file = dataURLtoBlob(canvas.toDataURL())
      // let data = await JSON.stringify(points);
      // input.value = JSON.stringify(points);
    });
  } else if (path === "newsquiggle") {
    form.addEventListener("submit", async () => {
      input.value = JSON.stringify(points);
      input3.value = cwidth;
    });
  }

  console.log("event listeners added");
};

// ON LOAD ------------------

window.addEventListener("load", async () => {
  // run different function depending on pathname: newsquiggle or play
  if (window.location.pathname.split("/")[2] == "newsquiggle") {
    generateColourScheme(colours);
    backgroundFill();
    ctx.strokeStyle = strokeColour;
    drawScaling();
    addListeners("newsquiggle");

    // load eventlisteners immediately
  } else if (window.location.pathname.split("/")[1] == "play") {
    generateColourScheme(colours);
    backgroundFill();
    let json = await fetchSquiggle();
    let squiggleId = json._id;

    //set squiggle id in report form
    document
      .querySelector("#report-squiggle")
      .setAttribute("action", `/report/squiggle/${squiggleId}`);
    //
    squiggle = JSON.parse(json.line);

    originalSize = json.size;
    scaleFactor = cwidth / originalSize;

    // this section saves the squiggle (as base64 png) to the form input before the squiggle is animated
    renderScaling();
    drawFromPoints(squiggle, squiggleColour);
    drawScaling();
    let dataURL = await canvas.toDataURL();
    input2.value = dataURL;
    IDinput.value = squiggleId;
    ctx.clearRect(0, 0, cwidth, cheight);
    backgroundFill();
    animateSquiggle();
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// touch-screen only content

// if ("ontouchstart" in document.documentElement) {
//   document
//     .querySelectorAll(".touch-only")
//     .forEach(e => (e.style.display = "block"));
// }
