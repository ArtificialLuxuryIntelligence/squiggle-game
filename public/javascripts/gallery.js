let squiggles;
const container = document.getElementById("gallery-container");

//fetch squiggle
const fetchSquiggles = async () => {
  const response = await fetch("/gallery/squiggles");
  const json = await response.json();
  return json;
};

/// render squiggles
window.addEventListener("load", async () => {
  squiggles = await fetchSquiggles();
  console.log(squiggles);
  console.log(squiggles.length);
  // drawFromPoints(squiggle, squiggleColour);
  // ctx.strokeStyle = strokeColour;
});
