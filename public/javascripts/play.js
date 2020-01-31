const body = document.body;
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
// let section = 0;
let squiggle;

//colour variables

//maybe save these in an object with
// squiggle colours will have corresponding stroke colour (even if it's not identical)
//generate random squiggleColour then generate strokeColour from the REMAINING colours
let squiggleColour, strokeColour;
const generateColourScheme = function(obj) {
  var keys = Object.keys(obj);
  let prop = obj[keys[(keys.length * Math.random()) << 0]];
  squiggleColour = prop.sqCol;
  let randomStrokeIndex = (prop.stCol.length * Math.random()) << 0;
  strokeColour = prop.stCol[randomStrokeIndex];
};

//why is this not something like: const colours = [{col1:"red", col2:"pink"},{col1:"blue", col2:["orange", "yellow"},{etc}]
const colours = {
  red: { sqCol: "red", stCol: ["orange", "yellow"] },
  blue: { sqCol: "blue", stCol: ["pink", "purple"] }
};

generateColourScheme(colours);

// let squiggleColour =
//   squiggleColours[Math.floor(Math.random() * squiggleColours.length)];
// let strokeColour =
//   strokeColours[Math.floor(Math.random() * strokeColours.length)];

let fillColour = "white";

//context styling
// canvas.width = window.innerWidth * 0.8;
// canvas.height = window.innerWidth * 0.8;
// ctx.filter = "blur(1px)";

//scaling canvas for better resolution
//this sets canvas width to window innerWidth so should only be used on MOBILE

//-4 below for box-sizing? set box-sizing global..

//todo: set maximum

const cwidth = window.innerWidth;
const cheight = window.innerHeight;
canvas.style.width = cwidth + "px";
canvas.style.height = cwidth + "px";

canvas.width = 600;
canvas.height = 600;

///diminensions of original device that created squiggle
let originalSize;
let scaleFactor;

//normalises canvas/device width ratio
let scaleFactor1 = 600 / cwidth;
ctx.scale(scaleFactor1, scaleFactor1);

//the canvas is rescaled when squiggle points (from any device width) are loaded

// MAKE TEST SO THAT THE FUNCTIONS BELOW ONLY RUN ONCE
let scaling = { renderScaling: true };

//for rendering squiggle
const renderScaling = () => {
  // console.log(`render scaling called`);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.lineWidth = originalSize / 100;
  scaling.renderScaling = true;
  // console.log(`render scaling run`);
};
const drawScaling = () => {
  let invScaleFactor = 1 / scaleFactor;
  ctx.scale(invScaleFactor, invScaleFactor);
  ctx.lineWidth = cwidth / 100;
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

//drawing mechanics

//smoothing radius
const chain = 8;
ctx.lineCap = "round";
ctx.lineJoin = "round";

//SMOOTHED line as user draws -
function draw() {
  if (isDrawing) {
    if (points[section].length == 0) {
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
      points[section].push({ x: mouse.x, y: mouse.y });
    } else {
      //smoothing
      let x1 = points[section][points[section].length - 1].x;
      let y1 = points[section][points[section].length - 1].y;
      let x2 = mouse.x;
      let y2 = mouse.y;

      //disatnce between points
      let dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      //angle between points
      let alpha = Math.atan2(x2 - x1, y2 - y1);

      if (dist < chain) {
        //do nothing (distance is too short)
      }
      if (dist >= chain) {
        //draw a new point in the direction of the mouse pointer
        x = (dist - chain) * Math.sin(alpha) + x1;
        y = (dist - chain) * Math.cos(alpha) + y1;

        ctx.lineTo(x, y);
        ctx.stroke();

        if (points[section]) {
          points[section].push({ x: x, y: y });
        }
      }
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
  ctx.strokeStyle = strokeColour;
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
  }, 50);
};

const mouseUpHandler = () => {
  {
    //if nothing was drawn (i.e. just a quick tap which does not draw with touch) -see touchDownHandler
    if (points[points.length - 1].length < 1) {
      // ctx.closePath();
      points.pop();
      if (section > 0) {
        section--;
      }
    }
    canvas.removeEventListener("mousemove", draw);

    // rerender drawing: (not needed unless fancy smoothing is done)
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
  backgroundFill();
  renderScaling();
  drawFromPoints(squiggle, squiggleColour);
  drawScaling();
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
  // input.value = JSON.stringify(points);
});

//fetch squiggle
const fetchSquiggle = async () => {
  const response = await fetch("/play/squiggle");
  const json = await response.json();

  return json;
};

/// render squiggle on load and save in form (formatted and ready to be submitted)
window.addEventListener("load", async () => {
  backgroundFill();
  json = await fetchSquiggle();
  squiggle = JSON.parse(json.line);
  originalSize = json.size;
  scaleFactor = cwidth / originalSize;

  // this section saves the complete squiggle to the form input before the squiggle is animated
  renderScaling();
  drawFromPoints(squiggle, squiggleColour);
  drawScaling();
  let dataURL = await canvas.toDataURL();
  input2.value = dataURL;
  ctx.clearRect(0, 0, cwidth, cheight);
  //
  animateSquiggle();
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

// function touchdraw() {
//   if (isDrawing) {
//     if (points[section].length == 0) {
//       ctx.lineTo(touch.x, touch.y);
//       ctx.stroke();
//       points[section].push({ x: touch.x, y: touch.y });
//     } else {
//       //smoothing radius (chain) set globally
//
//       let x1 = points[section][points[section].length - 1].x;
//       let y1 = points[section][points[section].length - 1].y;
//       let x2 = touch.x;
//       let y2 = touch.y;
//       //if distance is less that some set distance (chain)
//       // x = x1
//
//       //disatnce between points
//       let dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
//       //angle between drawFromPoints
//       let alpha = Math.atan2(x2 - x1, y2 - y1);
//
//       if (dist < chain) {
//         //do nothing (distance is too short)
//       }
//       if (dist >= chain) {
//         //draw a new point in the direction of the mouse pointer
//         x = (dist - chain) * Math.sin(alpha) + x1;
//         y = (dist - chain) * Math.cos(alpha) + y1;
//
//         ctx.lineTo(x, y);
//         ctx.stroke();
//
//         if (points[section]) {
//           points[section].push({ x: x, y: y });
//         }
//       }
//     }
//   }
// }
function touchdraw() {
  if (isDrawing) {
    // if (!points[points.length - 1]) {
    //   let arr = [];
    //   points.push(arr);
    // }
    let lastArray = points.slice(-1)[0];
    if (lastArray.length == 0) {
      ctx.lineTo(touch.x, touch.y);
      ctx.stroke();
      lastArray.push({ x: touch.x, y: touch.y });
    } else {
      //smoothing radius (chain) set globally
      //x1 is last point in lastArray (of points)
      let x1 = lastArray.slice(-1)[0].x;
      let y1 = lastArray.slice(-1)[0].y;

      // let x1 = points[section][points[section].length - 1].x;
      // let y1 = points[section][points[section].length - 1].y;
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
        x = (dist - chain) * Math.sin(alpha) + x1;
        y = (dist - chain) * Math.cos(alpha) + y1;

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

// const touchDownHandler = e => {
//   //50ms delay in drawing after touch so that multitouch pinch zoom doesn't draw on canvas
//   setTimeout(() => {
//     if (e.touches.length < 2) {
//       ctx.closePath();
//       let arr = [];
//       points.push(arr);
//       ctx.moveTo(touch.x, touch.y);
//       ctx.beginPath();
//       isDrawing = true;
//       canvas.addEventListener("touchmove", touchdraw, { passive: false });
//     } else {
//       isDrawing = false;
//       canvas.removeEventListener("touchmove", touchdraw, { passive: false });
//     }
//   }, 50);
// };

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

// const touchUpHandler = e => {
//   ctx.closePath();
//
//   canvas.removeEventListener("touchmove", touchdraw, { passive: false });
//
//   //if nothing was drawn (i.e. just a quick tap which does not draw with touch) -see touchDownHandler
//   if (points[points.length - 1].length < 1) {
//     // ctx.closePath();
//     points.pop();
//     if (section > 0) {
//       section--;
//     }
//   }
//   //rerender drawing: (not needed unless fancy smoothing is done)
//   // drawFromPoints(points);
//   if (isDrawing) {
//     section++;
//   }
//   isDrawing = false;
// };
const touchUpHandler = e => {
  ctx.closePath();

  canvas.removeEventListener("touchmove", touchdraw, { passive: false });

  //if nothing was drawn (i.e. just a quick tap which does not draw with touch) -see touchDownHandler
  if (points[points.length - 1].length < 1) {
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
};

canvas.addEventListener("touchstart", touchDownHandler, {
  passive: false
});
canvas.addEventListener("touchend", touchUpHandler);
// canvas.addEventListener("mouseout", mouseOutHandler);
canvas.addEventListener("touchmove", e => touchPos(e), { passive: false });

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
canvas.addEventListener(
  "touchmove",
  function(e) {
    if (e.touches.length < 2) {
      e.preventDefault();
    }
  },
  { passive: false }
);

///
// ZOOM magnifying glass {inspiration: https://jsfiddle.net/powerc9000/G39W9/}

// const zoom = document.getElementById("zoom");
// const zoomCtx = zoom.getContext("2d");
// const zoomToggle = document.getElementById("zoomtoggle");
//
// zoomToggle.addEventListener("click", () => {
//   if (zoomToggle.classList.contains("zoom-on")) {
//     zoomToggle.classList.remove("zoom-on");
//     canvas.removeEventListener("mousemove", mouseMoveZoomHandler);
//     canvas.removeEventListener("mouseout", mouseOutZoomHandler);
//     canvas.removeEventListener("touchmove", touchMoveZoomHandler);
//     // canvas.removeEventListener("touchend", touchEndZoomHandler);
//   } else {
//     zoomToggle.classList.add("zoom-on");
//     canvas.addEventListener("mousemove", mouseMoveZoomHandler);
//     canvas.addEventListener("mouseout", mouseOutZoomHandler);
//     canvas.addEventListener("touchmove", touchMoveZoomHandler);
//     canvas.addEventListener("touchend", touchEndZoomHandler);
//   }
// });

//Event Handlers
// const mouseMoveZoomHandler = function(e) {
//   // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
//   zoomCtx.drawImage(
//     canvas,
//     mouse.x - 12.5,
//     mouse.y - 12.5,
//     25,
//     25,
//     0,
//     0,
//     150,
//     150
//   );
//   zoom.style.top = e.pageY + 10 + "px";
//   zoom.style.left = e.pageX + 10 + "px";
//   zoom.style.display = "block";
// };
// function mouseOutZoomHandler() {
//   zoom.style.display = "none";
// }
// const touchMoveZoomHandler = function(e) {
//   // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
//   zoomCtx.drawImage(
//     canvas,
//     touch.x - 12.5,
//     touch.y - 12.5,
//     25,
//     25,
//     0,
//     0,
//     150,
//     150
//   );
//   var rect = canvas.getBoundingClientRect();
//
//   zoom.style.top = rect.bottom + "px";
//   zoom.style.left = rect.left + 75 + "px";
//   zoom.style.display = "block";
// };
// function touchEndZoomHandler() {
//   setTimeout(() => (zoom.style.display = "none"), 1000);
// }

// canvas.style.transform = "scale(2,2)";

// ------- animate canvas
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
