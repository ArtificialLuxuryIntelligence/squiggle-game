const cont = document.getElementById("gallery-container");
const loader = document.getElementById("loader");
const pageCont = document.querySelector(".container");

pageCont.style.width = window.innerWidth;

let pageNum = 0;

//fetch squiggle

async function loadImages(page) {
  const fetchSquiggles = async page => {
    const response = await fetch("/gallery/squiggles/" + page);
    const json = await response.json();
    return json;
  };

  function addImage(source1, source2) {
    let i = document.createElement("img");
    i.src = source1;
    i.addEventListener("mouseover", () => {
      i.setAttribute("src", source2);
    });
    i.addEventListener("mouseout", () => {
      i.setAttribute("src", source1);
    });
    cont.insertBefore(i, loader);
  }

  let squiggles = await fetchSquiggles(page);

  if (squiggles.length == 0) {
    loader.innerHTML = "end of the squiggleverse";
  }

  squiggles.forEach(squiggle => {
    addImage(squiggle.img2.data, squiggle.img.data);
  });
  console.log(pageNum);
  console.log(squiggles);

  pageNum++;
}

// intersection observer

let options = {
  root: null,
  rootMargin: "100px",
  threshold: 1.0
};

let observer = new IntersectionObserver(() => loadImages(pageNum));

observer.observe(loader);
