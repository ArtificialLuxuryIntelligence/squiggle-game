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
    let png = squiggles[i].img.data;
    let png2 = squiggles[i].img2.data;

    let squiggleImg = document.createElement("img");
    squiggleImg.setAttribute("src", png2);
    squiggleImg.addEventListener("mouseover", () => {
      squiggleImg.setAttribute("src", png);
    });
    squiggleImg.addEventListener("mouseout", () => {
      squiggleImg.setAttribute("src", png2);
    });

    container.append(squiggleImg);
  }
});
