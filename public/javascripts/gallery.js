const container = document.getElementById("gallery-container");
const image = document.getElementById("test-image");

//fetch squiggle
const fetchSquiggles = async () => {
  const response = await fetch("/gallery/squiggles");
  const json = await response.json();
  return json;
};

/// render squiggles
window.addEventListener("load", async () => {
  const squiggles = await fetchSquiggles();
  console.log(squiggles);

  for (let i = 0; i < squiggles.length; i++) {
    let squiggleImg = document.createElement("img");
    let data = squiggles[i].img.data;
    squiggleImg.src = data;
    container.append(squiggleImg);
  }
});
