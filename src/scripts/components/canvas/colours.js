const colours = [
  { sqCol: "red", stCol: ["orange", "yellow"] },
  { sqCol: "blue", stCol: ["pink", "purple"] },
  { sqCol: "green", stCol: ["blue", "turquoise"] },
];

const generateColourScheme = function () {
  let squiggleColour, strokeColour;
  let obj = colours[Math.floor(Math.random() * colours.length)];
  squiggleColour = obj.sqCol;
  let rand = Math.floor(obj.stCol.length * Math.random());
  strokeColour = obj.stCol[rand];
  return { squiggleColour, strokeColour };
};

export { generateColourScheme };
