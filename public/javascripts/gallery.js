const cont = document.getElementById("gallery-container");
const loader = document.getElementById("loader");
const pageCont = document.querySelector(".container");

// pageCont.style.width = window.innerWidth;

let pageNum = 0;

// touch-screen only content
if ("ontouchstart" in document.documentElement) {
  document
    .querySelectorAll(".touch-only")
    .forEach(e => (e.style.display = "block"));
} else {
}

//fetch squiggle

async function loadImages(page) {
  const fetchSquiggles = async page => {
    const response = await fetch("/gallery/squiggles/" + page);
    const json = await response.json();
    console.log(json);

    return json;
  };

  function addImage(source1, source2) {
    let i = document.createElement("img");
    i.src = source1;
    i.addEventListener("mouseover", () => {
      // i.setAttribute("src", "data:image/jpeg;base64," + source2);
      i.setAttribute("src", source2);
    });
    i.addEventListener("mouseout", () => {
      // i.setAttribute("src", "data:image/jpeg;base64," + source1);
      i.setAttribute("src", source1);
    });
    return i;
    // cont.insertBefore(i, loader);
  }

  function addReportButton(id) {
    let f = document.createElement("form");
    f.setAttribute("method", "POST");
    f.setAttribute("action", `/report/completedsquiggle/${id}`);
    let s = document.createElement("input");
    s.setAttribute("type", "submit");
    s.setAttribute("value", "report");
    s.setAttribute("id", "report-squiggle-btn");
    f.appendChild(s);
    // cont.insertBefore(f, loader);
    return f;
  }

  let squiggles = await fetchSquiggles(page);

  if (squiggles.length == 0) {
    loader.innerHTML = "end of the squiggleverse";
  }

  squiggles.forEach(squiggle => {
    let imgcont = document.createElement("div");
    imgcont.appendChild(addImage(squiggle.img2.data, squiggle.img.data));
    imgcont.appendChild(addReportButton(squiggle._id));
    cont.insertBefore(imgcont, loader);
  });

  // console.log(pageNum);
  // console.log(squiggles);

  pageNum++;
}

// intersection observers

// (lazy load images on scroll)

let options = {
  root: null,
  rootMargin: "100px",
  threshold: 1.0
};

let observer = new IntersectionObserver(() => loadImages(pageNum));

observer.observe(loader);

// scroll to top button
const toTopButton = document.getElementById("to-top");

const showScrollToTop = () => {
  toTopButton.style.opacity = 1;
  toTopButton.style.pointerEvents = "all";
};

const hideScrollToTop = () => {
  toTopButton.style.opacity = 0;
  toTopButton.style.pointerEvents = "none";
};

let toTopOptions = {
  root: null,
  rootMargin: "300px"
};

const homeButton = document.querySelector("#home-link");

let toTopObserver = new IntersectionObserver(entries => {
  entries.forEach(entry =>
    entry.isIntersecting ? hideScrollToTop() : showScrollToTop()
  );
}, toTopOptions);
// console.log("it works"), toTopOptions;

toTopObserver.observe(homeButton);
