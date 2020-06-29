import { CanvasComponent } from "../components/canvas/CanvasComponent";

const fetchSquiggle = async () => {
  const response = await fetch("/play/squiggle");
  const json = await response.json();
  return json;
};

let CanvasComp;

window.addEventListener("load", async () => {
  if (window.location.pathname == "/play") {
    let json = await fetchSquiggle();

    let squiggleData = {
      line: await JSON.parse(json.line),
      originalSize: json.size,
      squiggleId: json._id,
    };
    // console.log(squiggleData);

    CanvasComp = new CanvasComponent({
      canvas: "canvas",
      overlayCanvas: "canvas2",
      squiggleData: squiggleData,
      undo: "undo",
      rotate: "rotate",
      submitForm: "submit-form",
      reportSquiggle: "report-squiggle",
      dataInput: "hiddenField",
      pngInput: "hiddenField2",
      originalSizeInput: "hiddenField3",
      squiggleIdInput: "idinput",
    });

    // CanvasComp.init();
    window.c = CanvasComp;
  } else {
    CanvasComp = new CanvasComponent({
      canvas: "canvas",
      overlayCanvas: "canvas2",
      squiggleData: null,
      undo: "undo",
      rotate: "rotate",
      submitForm: "submit-form",
      reportSquiggle: "report-squiggle",
      dataInput: "hiddenField",
      pngInput: "hiddenField2",
      originalSizeInput: "hiddenField3",
      squiggleIdInput: "idinput",
    });
  }
});
