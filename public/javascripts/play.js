//note: this file is now imported as a module in game.hbs

// import hello, { hi } from "./hello.mjs";
// hi();
// hello();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// CONTENTS
// colour;
// scaling;
// drawing;
//   touch
//   mouse
// button handlers
// fetch;
// animate;
// event listeners
// on window load

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const body = document.body;
const canvas2 = document.getElementById("canvas2");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
//circle overlay canvas
const ctx2 = canvas2.getContext("2d");

const undo = document.getElementById("undo");
const restart = document.getElementById("restart");
const form = document.getElementById("submit-form");
const input = document.getElementById("hiddenField");
const input2 = document.getElementById("hiddenField2");
const input3 = document.getElementById("hiddenField3");
const mouse = { x: 0, y: 0 };
const touch = { x: 0, y: 0 };
let isDrawing = false;
let points = [];
let section;
let squiggle;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//COLOUR
let squiggleColour, strokeColour;

const colours = [
  { sqCol: "red", stCol: ["orange", "yellow"] },
  { sqCol: "blue", stCol: ["pink", "purple"] },
  { sqCol: "green", stCol: ["blue", "turquoise"] }
];

const generateColourScheme = function(arr) {
  let obj = arr[Math.floor(Math.random() * arr.length)];
  squiggleColour = obj.sqCol;
  let rand = Math.floor(obj.stCol.length * Math.random());
  strokeColour = obj.stCol[rand];
  // var keys = Object.keys(obj);
  // let prop = obj[keys[(keys.length * Math.random()) << 0]];
  // squiggleColour = prop.sqCol;
  // let randomStrokeIndex = (prop.stCol.length * Math.random()) << 0;
  // strokeColour = prop.stCol[randomStrokeIndex];
};

///
generateColourScheme(colours);

// let squiggleColour =
//   squiggleColours[Math.floor(Math.random() * squiggleColours.length)];
// let strokeColour =
//   strokeColours[Math.floor(Math.random() * strokeColours.length)];

let fillColour = "white";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//SCALING canvas for better resolution

//(canvas2 is for circle overlay)

const maxWidth = 600;

const cwidth = window.innerWidth < maxWidth ? window.innerWidth - 10 : maxWidth; //max canvas width 600
const cheight = window.innerHeight;

canvas.style.width = cwidth + "px";
canvas.style.height = cwidth + "px";
canvas2.style.width = cwidth + "px";
canvas2.style.height = cwidth + "px";

//decent quality/file-size
canvas.width = 600;
canvas.height = 600;
canvas2.width = 600;
canvas2.height = 600;

//normalises canvas/device width ratio
let scaleFactor1 = 600 / cwidth;
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

  ctx.lineWidth = originalSize / 100;
  ctx2.lineWidth = originalSize / 300;

  scaling.renderScaling = true;
  // console.log(`render scaling run`);
};
const drawScaling = () => {
  let invScaleFactor = 1 / scaleFactor;
  ctx.scale(invScaleFactor, invScaleFactor);
  ctx2.scale(invScaleFactor, invScaleFactor);

  ctx.lineWidth = cwidth / 100;
  ctx2.lineWidth = cwidth / 300;

  scaling.renderScaling = false;
};

// ctx.lineWidth = cwidth / 100; //??

// console.log(ctx);

// fixed scaling
// canvas.style.width = "300px";
// canvas.style.height = "300px";
// canvas.width = 600;
// canvas.height = 600;
// ctx.lineWidth = 3;
// ctx.scale(2, 2);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//DRAWING mechanics

//smoothing radius
const chain = 4;
ctx.lineCap = "round";
ctx.lineJoin = "round";

//currently using white so might not be need at all
const backgroundFill = () => {
  ctx.fillStyle = fillColour;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
};

// draw from array of array of points
const drawFromPoints = (collection, strokecolour) => {
  ctx.strokeStyle = strokecolour;
  for (let i = 0; i < collection.length; i++) {
    // ctx.moveTo(collection[i][0].x, collection[i][0].y);
    ctx.beginPath();
    for (let j = 0; j < collection[i].length; j++) {
      // linear;
      ctx.lineTo(collection[i][j].x, collection[i][j].y);
      // ctx.moveTo(collection[i][j].x, collection[i][j].y);
    }
    ctx.stroke();
    ctx.closePath();
  }
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
      touch.y = rect.left + e.touches[0].clientX;
      return;
    default:
      null;
  }
}

function touchdraw() {
  if (isDrawing) {
    let lastArray = points.slice(-1)[0];
    drawCircle(lastArray, touch);

    if (lastArray.length == 0) {
      ctx.lineTo(touch.x, touch.y);
      ctx.stroke();
      lastArray.push({ x: touch.x, y: touch.y });
    } else {
      //smoothing radius (chain) set globally
      //x1 is last point in lastArray (of points)
      let x1 = lastArray.slice(-1)[0].x;
      let y1 = lastArray.slice(-1)[0].y;
      let x2 = touch.x;
      let y2 = touch.y;

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

        ctx.lineTo(x, y);
        ctx.stroke();

        lastArray.push({ x: x, y: y });
        // if (points[section]) {
        //   points[section].push({ x: x, y: y });
        // }
      }
    }
  }
}

//  -------------------- TOUCH Handlers

const touchDownHandler = e => {
  //50ms delay in drawing after touch so that multitouch pinch zoom doesn't draw on canvas
  setTimeout(() => {
    if (e.touches.length < 2 && e.touches.length > 0) {
      ctx.closePath();
      //creates new section of drawing
      let arr = [];
      points.push(arr);
      ctx.strokeStyle = strokeColour;
      ctx.moveTo(touch.x, touch.y);
      ctx.beginPath();
      isDrawing = true;
      canvas.addEventListener("touchmove", touchdraw, { passive: false });
    } else {
      isDrawing = false;
      canvas.removeEventListener("touchmove", touchdraw, { passive: false });
    }
  }, 50);
};

const touchUpHandler = e => {
  if (isDrawing) {
    ctx2.clearRect(0, 0, cwidth, cheight);
    ctx.closePath();
    canvas.removeEventListener("touchmove", touchdraw, { passive: false });

    //if nothing was drawn (i.e. just a quick tap which does not draw with touch) -see touchDownHandler
    if (points[points.length - 1].length === 0) {
      // ctx.closePath();
      points.pop();
      // if (section > 0) {
      //   section--;
      // }
    }
    //rerender drawing: (not needed unless fancy smoothing is done)
    // drawFromPoints(points);
    // if (isDrawing) {
    //   section++;
    // }
    isDrawing = false;
  }
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
      mouse.y = rect.left + e.clientX;
      return;
    default:
      null;
  }
}

function draw() {
  if (isDrawing) {
    console.log(points);

    let lastArray = points.slice(-1)[0];
    drawCircle(lastArray, mouse);

    if (lastArray.length == 0) {
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
      lastArray.push({ x: mouse.x, y: mouse.y });
      console.log("LastArray length 0");
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

        ctx.lineTo(x, y);
        ctx.stroke();

        lastArray.push({ x: x, y: y });
        // if (points[section]) {
        //   points[section].push({ x: x, y: y });
        // }
      }
    }
  }
}

//  -------------------- MOUSE  Handlers

//////////////////////////////

const mouseDownHandler = () => {
  ctx.strokeStyle = strokeColour;
  ctx.fillStyle = strokeColour;
  ctx.closePath();
  points.push([]);
  ctx.moveTo(mouse.x, mouse.y);
  ctx.beginPath();
  isDrawing = true;

  canvas.addEventListener("mousemove", draw);
  // draws first pixel before mouse moves take over drawing job
  //needs to be with of stroke width , not 1
  // ctx.fillRect(mouse.x, mouse.y, 1, 1);
  // if (points[section]) {
  //   points[section].push({ x: mouse.x, y: mouse.y });
  // }
};

const mouseUpHandler = () => {
  canvas.removeEventListener("mousemove", draw);

  if (isDrawing) {
    ctx2.clearRect(0, 0, cwidth, cheight);
    ctx.closePath();
    isDrawing = false;
    //remove any point arrays with no content (a quick click or touch doesn't draw anything)
    points = points.filter(arr => arr.length !== 0);
  }
};

const mouseOutHandler = () => {
  canvas.removeEventListener("mousemove", draw);
  if (isDrawing) {
    section++;
  }
  isDrawing = false;
};

//  --------------------  GENERAL button handlers

const undoHandler = points => {
  points.pop();
  // if (section > 0) {
  //   section--;
  // }
  ctx.clearRect(0, 0, cwidth, cheight);
  backgroundFill();
  renderScaling();
  drawFromPoints(squiggle, squiggleColour);
  drawScaling();
  drawFromPoints(points, strokeColour);
};

const resetCanvas = () => {
  ctx.clearRect(0, 0, cwidth, cheight);

  if (window.location.pathname.split("/")[1] == "play") {
    backgroundFill();
    renderScaling();
    drawFromPoints(squiggle, squiggleColour);
    drawScaling();
    ctx.strokeStyle = strokeColour;
    section = 0;
    points = [];
    isDrawing = false;
  }
};
let turns = 0;
const rotate = async () => {
  turns++;
  console.log((turns % 4) + 1);

  ctx.clearRect(0, 0, cwidth, cwidth);

  //rotate canvas and rerender
  ctx.translate(cwidth / 2, cwidth / 2); //both cwidth (is a square)
  ctx.rotate(Math.PI / 2);
  ctx.translate(-cwidth / 2, -cwidth / 2);

  ctx2.translate(cwidth / 2, cwidth / 2);
  ctx2.rotate(Math.PI / 2);
  ctx2.translate(-cwidth / 2, -cwidth / 2);

  //
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
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // ctx.fill();

  // start the animation
  let t = 1;
  let i = 0;
  animate();

  function animate() {
    if (squiggle[i] && t < squiggle[i].length - 1) {
      requestAnimationFrame(animate);
      //increments i in order to move to next section of squiggle
    } else if (i < squiggle.length) {
      setTimeout(() => {
        i++;
        t = 1;
        requestAnimationFrame(animate);
      }, 300);
    }
    if (i == squiggle.length) {
      console.log("...animation complete");
      addListeners("play");
      drawScaling();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(squiggle[i][t - 1].x, squiggle[i][t - 1].y);
    ctx.lineTo(squiggle[i][t].x, squiggle[i][t].y);
    ctx.stroke();
    t++;
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

const addListeners = path => {
  console.log("event listeners added");
  restart.addEventListener("click", rotate); //CHANGED FOR TESTING!!!!!!

  canvas.addEventListener("touchstart", touchDownHandler, {
    passive: false
  });
  canvas.addEventListener("touchend", touchUpHandler);
  // canvas.addEventListener("mouseout", mouseOutHandler);
  canvas.addEventListener("touchmove", e => touchPos(e), { passive: false });
  canvas.addEventListener(
    "touchmove",
    function(e) {
      if (e.touches.length < 2) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  canvas.addEventListener("mousedown", mouseDownHandler);
  canvas.addEventListener("mouseup", mouseUpHandler);
  canvas.addEventListener("mousemove", e => mousePos(e));
  canvas.addEventListener("mouseout", mouseOutHandler);

  if (path === "play") {
    undo.addEventListener("click", () => undoHandler(points));
    form.addEventListener("submit", async () => {
      let dataURL = await canvas.toDataURL();
      input.value = dataURL;
      // let data = await JSON.stringify(points);
      // input.value = JSON.stringify(points);
    });
  } else if (path === "newsquiggle") {
    form.addEventListener("submit", async () => {
      input.value = JSON.stringify(points);
      input3.value = cwidth;
    });
  }
};

// ON LOAD ------------------

window.addEventListener("load", async () => {
  // run different function depending on pathname: newsquiggle or play
  if (window.location.pathname.split("/")[1] == "newsquiggle") {
    // let squiggleColour = "#36494E";
    // let strokeColour = "#9E2A2B";
    // let fillColour = "white";
    backgroundFill();
    ctx.strokeStyle = strokeColour;
    drawScaling();
    addListeners("newsquiggle");

    // load eventlisteners immediately
  } else if (window.location.pathname.split("/")[1] == "play") {
    backgroundFill();
    let json = await fetchSquiggle();
    squiggle = JSON.parse(json.line);
    originalSize = json.size;
    scaleFactor = cwidth / originalSize;

    // this section saves the squiggle to the form input before the squiggle is animated
    renderScaling();
    drawFromPoints(squiggle, squiggleColour);
    drawScaling();
    let dataURL = await canvas.toDataURL();
    input2.value = dataURL;
    ctx.clearRect(0, 0, cwidth, cheight);
    animateSquiggle();
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
