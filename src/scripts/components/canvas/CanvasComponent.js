import { generateColourScheme } from "./colours";
import { drawFromPoints } from "./drawFromPoints";

//import fetch squiggle (make more general?)
//import drawfrompts

const path = window.location.pathname.split("/")[1];
const chain = 4;
const fillColour = "white"; //background
const maxWidth = 600;

//helper function

//this will be used if pathname is right in play.js
const fetchSquiggle = async () => {
  const response = await fetch("/play/squiggle");
  const json = await response.json();

  return json;
};

class CanvasComponent {
  constructor({
    canvas,
    overlayCanvas,
    squiggleData,
    undo,
    rotate,
    submitForm,
    reportSquiggle,
    dataInput,
    pngInput,
    squiggleIdInput,
    originalSizeInput,
  }) {
    //DOM
    this.cwidth = window.innerWidth < maxWidth ? window.innerWidth : maxWidth; //max this.canvas width 600px in brower
    //buttons
    this.rotate = document.getElementById(rotate);
    this.undo = document.getElementById(undo);
    this.submit = document.getElementById(submit);
    this.buttons = document.querySelectorAll(".button");
    //form and inputs
    this.form = document.getElementById(submitForm);
    this.input = document.getElementById(dataInput);
    this.input2 = document.getElementById(pngInput);
    this.input3 = document.getElementById(originalSizeInput);
    this.IDinput = document.getElementById(squiggleIdInput);
    this.reportSquiggle = document.getElementById(reportSquiggle);
    //canvas
    this.canvas = document.getElementById(canvas);
    this.ctx = this.canvas.getContext("2d");
    this.canvas2 = document.getElementById(overlayCanvas);
    this.ctx2 = this.canvas2.getContext("2d");

    if (squiggleData) {
      this.originalSize = squiggleData.originalSize;
      this.squiggle = squiggleData.line;
      this.squiggleId = squiggleData.squiggleId;
      this.scaleFactor = this.cwidth / this.originalSize;
    }

    // drawing mechanics
    this.colours = generateColourScheme();
    this.mouse = { x: 0, y: 0 };
    this.touch = { x: null, y: null };
    this.isDrawing = false;
    //variable to hold user line drawing (requestAnimationFrame)
    this.drawAnim = null;
    this.points = [];
    this.turns = 0;

    this.init();
  }
  init() {
    console.log("initializing ");

    console.log("SF", this.scaleFactor);
    // console.log("os", this.originalSize);

    //initial this.canvas sizing
    //all in one row?
    this.canvas.style.width = this.cwidth + "px";
    this.canvas.style.height = this.cwidth + "px";
    this.canvas2.style.width = this.cwidth + "px";
    this.canvas2.style.height = this.cwidth + "px";

    const size = this.cwidth * window.devicePixelRatio;

    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas2.width = size;
    this.canvas2.height = size;

    //normalises canvas/device width ratio
    let scaleFactor1 = size / this.cwidth; //same as devpixratio
    console.log("SF1", scaleFactor1);

    this.ctx.scale(scaleFactor1, scaleFactor1);
    this.ctx2.scale(scaleFactor1, scaleFactor1);

    // console.log(this.canvas.width);
    // console.log(this.canvas.style.width);
    // console.log(this.ctx);

    //the class will be run on load? (or ignore the load altogether?)
    (async () => {
      // run different function depending on pathname: newsquiggle or play
      if (window.location.pathname.split("/")[2] == "newsquiggle") {
        this.backgroundFill();
        this.ctx.strokeStyle = this.colours.strokeColour;

        this.drawScaling();
        this.addListeners("newsquiggle");

        // load eventlisteners immediately
      } else if (window.location.pathname.split("/")[1] == "play") {
        this.backgroundFill();

        //set squiggle id in report form
        this.reportSquiggle.setAttribute(
          "action",
          `/report/squiggle/${this.squiggleId}`
        );
        //

        // this section saves the squiggle (as base64 png) to the form input before the squiggle is animated
        //(might just save as array of this.points in the future - smaller than png)

        this.renderScaling();
        drawFromPoints(this.ctx, this.squiggle, this.colours.squiggleColour);
        this.drawScaling();

        let dataURL = await this.canvas.toDataURL();
        this.input2.value = dataURL;
        this.IDinput.value = this.squiggleId;
        this.ctx.clearRect(0, 0, this.cwidth, this.cwidth);
        this.backgroundFill();

        this.animateSquiggle();
      }
    })();
    //add listeners etc see onload section
    //the await fetchsquiggle will be sync here;
    //----the await part will be before this whole component is loaded in page scripts (and then the squiggle passed to constructor)
  }

  //button handlers
  undoHandler() {
    this.points.pop();
    this.rerender();
  }
  async rotateCanvasHandler() {
    this.turns++;

    console.log(this.turns);

    // console.log((turns % 4) + 1);

    this.ctx.clearRect(0, 0, this.cwidth, this.cwidth);
    this.backgroundFill();

    //rotate this.canvas and rerender
    this.ctx.translate(this.cwidth / 2, this.cwidth / 2); //both this.cwidth (is a square)
    this.ctx.rotate(Math.PI / 2);
    this.ctx.translate(-this.cwidth / 2, -this.cwidth / 2);

    this.ctx2.translate(this.cwidth / 2, this.cwidth / 2);
    this.ctx2.rotate(Math.PI / 2);
    this.ctx2.translate(-this.cwidth / 2, -this.cwidth / 2);

    // same as rerender function: (with save)
    this.renderScaling(); //ok
    drawFromPoints(this.ctx, this.squiggle, this.colours.squiggleColour);
    this.drawScaling();
    this.ctx.strokeStyle = this.colours.strokeColour;
    let dataURL = await this.canvas.toDataURL(); //saves newly rotated squiggle
    this.input2.value = dataURL;
    drawFromPoints(this.ctx, this.points, this.colours.strokeColour);
    this.isDrawing = false;
    //
  }
  //  submitHandler [create 2: handlePlaySubmit and handleNewSquiggleSubmit]

  //

  //rendering

  //for rendering squiggle
  renderScaling() {
    console.log(`render scaling called`);

    this.ctx.scale(this.scaleFactor, this.scaleFactor);
    this.ctx2.scale(this.scaleFactor, this.scaleFactor);

    this.ctx.lineWidth = this.originalSize / 60;
    this.ctx2.lineWidth = this.originalSize / 300;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    // scaling.renderScaling = true;
    // console.log(`render scaling run`);
  }

  //inverses renderscaling
  drawScaling() {
    console.log(`draw scaling called`);

    let invScaleFactor = 1 / this.scaleFactor;
    this.ctx.scale(invScaleFactor, invScaleFactor);
    this.ctx2.scale(invScaleFactor, invScaleFactor);
    // console.log(this.ctx.lineWidth);

    this.ctx.lineWidth = this.cwidth / 60;
    this.ctx2.lineWidth = this.cwidth / 300;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  // drawFromPoints //imported function?? (with extra argument - this.canvas/context)
  // drawFromPoints(collection, strokecolour) {
  //   this.ctx.strokeStyle = strokecolour;
  //   for (let i = 0; i < collection.length; i++) {
  //     // this.ctx.moveTo(collection[i][0].x, collection[i][0].y);
  //     this.ctx.beginPath();
  //     for (let j = 0; j < collection[i].length - 1; j++) {
  //       // linear;
  //       // this.ctx.lineTo(collection[i][j].x, collection[i][j].y);

  //       //quadratic:
  //       const midPoint = midPointOf(collection[i][j], collection[i][j + 1]);
  //       this.ctx.quadraticCurveTo(
  //         collection[i][j].x,
  //         collection[i][j].y,
  //         midPoint.x,
  //         midPoint.y
  //       );
  //     }
  //     //straight line to last pt.
  //     this.ctx.lineTo(
  //       collection[i][collection[i].length],
  //       collection[i][collection[i].length]
  //     );

  //     this.ctx.stroke();
  //     this.ctx.closePath();
  //   }
  // }

  //  backgroundFill (probably overused)
  backgroundFill() {
    this.ctx.fillStyle = fillColour;
    this.ctx.fillRect(0, 0, this.cwidth, this.cwidth);
  }

  // ---- include clearrect
  //  drawLoop (rename startDrawAnim ?)
  drawLoop() {
    //simple drawing here so probably not too bad to rerender the whole image each frame
    this.rerender();
    // this.drawAnim = requestAnimationFrame(drawLoop);
    this.drawAnim = requestAnimationFrame(this.drawLoop.bind(this));
  }
  //  drawCircle

  //  rerender
  rerender() {
    this.ctx.clearRect(0, 0, this.cwidth, this.cwidth);
    this.backgroundFill();
    this.renderScaling(); //ok
    if (this.squiggle) {
      drawFromPoints(this.ctx, this.squiggle, this.colours.squiggleColour);
    }
    this.drawScaling();
    drawFromPoints(this.ctx, this.points, this.colours.strokeColour);
  }

  //  animateSquiggle
  animateSquiggle() {
    const animate = () => {
      let squiggle = this.squiggle;
      if (squiggle[i] && p < squiggle[i].length) {
        //draw point by point
        let s = squiggle.slice(0, i + 1);
        let pop = s.pop();
        s.push(pop.slice(0, p + 1));
        drawFromPoints(this.ctx, s, this.colours.squiggleColour);
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
        this.addListeners("play");
        this.drawScaling();
        this.rerender();

        return;
      }

      // this.ctx.beginPath();
      // this.ctx.moveTo(squiggle[i][p - 1].x, squiggle[i][p - 1].y);
      // this.ctx.lineTo(squiggle[i][p].x, squiggle[i][p].y);
      // this.ctx.stroke();
      // p++;
    };

    this.renderScaling(); //ok
    console.log("animating...");
    this.ctx.strokeStyle = this.colours.squiggleColour;

    // start the animation
    let p = 0;
    let i = 0;
    // this.ctx.beginPath();

    animate();
  }

  //input position

  mousePos(e) {
    let rect = this.canvas.getBoundingClientRect();

    switch ((this.turns % 4) + 1) {
      case 1:
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        return;
      case 2:
        this.mouse.x = e.clientY - rect.top;
        this.mouse.y = -e.clientX + rect.right;
        return;
      case 3:
        this.mouse.x = rect.right - e.clientX;
        this.mouse.y = rect.bottom - e.clientY;
        return;
      case 4:
        this.mouse.x = rect.bottom - e.clientY;
        this.mouse.y = -rect.left + e.clientX;
        return;
      default:
        null;
    }
  }
  touchPos(e) {
    let rect = this.canvas.getBoundingClientRect();

    switch ((this.turns % 4) + 1) {
      case 1:
        this.touch.x = e.touches[0].clientX - rect.left;
        this.touch.y = e.touches[0].clientY - rect.top;
        return;
      case 2:
        this.touch.x = e.touches[0].clientY - rect.top;
        this.touch.y = -e.touches[0].clientX + rect.right;
        return;
      case 3:
        this.touch.x = rect.right - e.touches[0].clientX;
        this.touch.y = rect.bottom - e.touches[0].clientY;
        return;
      case 4:
        this.touch.x = rect.bottom - e.touches[0].clientY;
        this.touch.y = -rect.left + e.touches[0].clientX;
        return;
      default:
        null;
    }
  }

  //  addlisteners function;

  //  all handlers:

  mouseDownHandler() {
    this.canvas.addEventListener("mousemove", () => this.mouseMoveHandler());
    this.drawAnim = requestAnimationFrame(this.drawLoop.bind(this));

    this.ctx.strokeStyle = this.colours.strokeColour;
    this.ctx.fillStyle = this.colours.strokeColour;
    // this.ctx.closePath();
    this.points.push([]);
    this.ctx.moveTo(this.mouse.x, this.mouse.y);
    this.ctx.beginPath();
    this.isDrawing = true;
  }

  mouseMoveHandler() {
    let mouse = this.mouse;
    console.log(this.mouse);

    //shouldnt need this check
    if (this.isDrawing) {
      // console.log(mouse);

      let lastArray = this.points.slice(-1)[0];

      if (lastArray.length == 0) {
        lastArray.push({ x: mouse.x, y: mouse.y });
      } else {
        //smoothing radius (chain) set globally
        //x1 is last point in lastArray (of this.points)
        let x1 = lastArray.slice(-1)[0].x;
        let y1 = lastArray.slice(-1)[0].y;
        let x2 = mouse.x;
        let y2 = mouse.y;

        //disatnce between this.points
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
  }

  mouseUpHandler() {
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    cancelAnimationFrame(this.drawAnim);

    if (this.isDrawing) {
      this.ctx2.clearRect(0, 0, this.cwidth, this.cwidth);
      // this.ctx.closePath();
      this.isDrawing = false;
      //remove any point arrays with no content (a quick click or touch doesn't draw anything)
      this.points = this.points.filter((arr) => arr.length !== 0);
      this.rerender();
    }
  }

  mouseOutHandler() {
    this.canvas.removeEventListener("mousemove", () => this.mouseMoveHandler());
    cancelAnimationFrame(this.drawAnim);
    this.isDrawing = false;
  }

  touchDownHandler(e) {
    this.canvas.addEventListener("touchmove", (e) => this.touchMoveHandler(e), {
      passive: false,
    });
    this.drawAnim = requestAnimationFrame(this.drawLoop.bind(this));

    //50ms delay in drawing after touch so that multitouch pinch zoom doesn't draw on this.canvas
    setTimeout(() => {
      if (e.touches.length === 1) {
        this.isDrawing = true;

        // this.ctx.closePath();
        //creates new section of drawing
        let arr = [];
        this.points.push(arr);
        this.ctx.strokeStyle = this.colours.strokeColour;

        this.ctx.moveTo(this.touch.x, this.touch.y); // move this outside of timeout? (to avoid x:0, y:0 issue in animation frame)
        this.ctx.beginPath();
      } else {
        // console.log("ended drawing");

        this.isDrawing = false;
        this.canvas.removeEventListener(
          "touchmove",
          () => this.touchMoveHandler,
          {
            passive: false,
          }
        );
      }
    }, 50);
  }

  touchMoveHandler(e) {
    let touch = this.touch;
    if (this.isDrawing) {
      let lastArray = this.points.slice(-1)[0];

      if (lastArray.length == 0) {
        lastArray.push({ x: touch.x, y: touch.y });
      } else {
        let x1 = lastArray.slice(-1)[0].x;
        let y1 = lastArray.slice(-1)[0].y;
        let x2 = touch.x;
        let y2 = touch.y;

        //disatnce between this.points
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
  }

  touchUpHandler(e) {
    if (this.isDrawing) {
      // this.ctx.closePath();

      // this.canvas.removeEventListener("touchmove", touchdraw, { passive: false });
      // this.canvas.removeEventListener("touchmove", drawingLoop, { passive: false });

      //if nothing was drawn (i.e. just a quick tap which does not draw with touch) -see touchDownHandler
      if (this.points[this.points.length - 1].length === 0) {
        // this.ctx.closePath();
        this.points.pop();
        // if (section > 0) {
        //   section--;
        // }
      }

      this.isDrawing = false;
      this.rerender();
    }
    // console.log("cancel anim ");

    cancelAnimationFrame(this.drawAnim);
  }
  //
  //

  addListeners(path) {
    this.buttons.forEach((button) => button.classList.remove("disabled"));

    if (
      "ontouchstart" in window ||
      navigator.MaxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    ) {
      this.undo.addEventListener("touchstart", () =>
        this.undoHandler(this.points)
      );
      this.canvas.addEventListener(
        "touchstart",
        (e) => this.touchDownHandler(e),
        {
          passive: false,
        }
      );
      window.addEventListener("touchend", () => this.touchUpHandler());
      this.canvas.addEventListener("touchmove", (e) => this.touchPos(e), {
        passive: false,
      });
      this.canvas.addEventListener(
        "touchmove",
        function (e) {
          if (e.touches.length < 2) {
            e.preventDefault();
          }
        },
        { passive: false }
      );
    } else {
      this.undo.addEventListener("click", () => this.undoHandler(this.points));
      this.canvas.addEventListener("mousedown", () => this.mouseDownHandler());
      this.canvas.addEventListener("mouseup", () => this.mouseUpHandler());
      this.canvas.addEventListener("mousemove", (e) => this.mousePos(e));
      this.canvas.addEventListener("mouseout", () => this.mouseOutHandler());
    }

    // undo.addEventListener("click", () => undoHandler(this.points));

    // ---------------- page specific listeners
    if (path === "play") {
      if (
        "ontouchstart" in window ||
        navigator.MaxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      ) {
        rotate.addEventListener("touchstart", () => this.rotateCanvasHandler());
      } else {
        rotate.addEventListener("click", () => this.rotateCanvasHandler());
      }

      this.form.addEventListener("submit", async (e) => {
        // e.preventDefault();
        let dataURL = await this.canvas.toDataURL();
        this.input.value = dataURL;

        // file = dataURLtoBlob(this.canvas.toDataURL())
        // let data = await JSON.stringify(this.points);
        // input.value = JSON.stringify(this.points);
      });
    } else if (path === "newsquiggle") {
      this.form.addEventListener("submit", async () => {
        this.input.value = JSON.stringify(this.points);
        this.input3.value = this.cwidth;
      });
    }

    console.log("event listeners added");
  }
  //
}

export { CanvasComponent };
