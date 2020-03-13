const cont = document.getElementById("gallery-container");
const squigCont = document.getElementById("squiggle-container");
const squigAllCont = document.getElementById("allsquiggle-container");

const loader = document.getElementById("loader");
const loader2 = document.getElementById("loader2");
const loader3 = document.getElementById("loader3");

const pageCont = document.querySelector(".container");

window.onload = function() {
  loadImages();
  loadSquiggles();
};

const formButton = (squiggle, buttonValue, action) => {
  let f = document.createElement("form");
  f.setAttribute("method", "POST");
  f.setAttribute("action", action + squiggle._id);
  let s = document.createElement("input");
  s.setAttribute("type", "submit");
  s.setAttribute("value", buttonValue);
  f.appendChild(s);
  // cont.insertBefore(f, loader);
  return f;
};

//fetch squiggle

async function loadImages() {
  const fetchSquiggles = async () => {
    const response = await fetch("/admin/removedcompletedsquiggles");
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
    return i;
    // cont.insertBefore(i, loader);
  }

  let squiggles = await fetchSquiggles();

  if (squiggles.length == 0) {
    loader.innerHTML = "no complete squiggles reported";
  }

  squiggles.forEach(squiggle => {
    let imgcont = document.createElement("div");
    imgcont.appendChild(addImage(squiggle.img2.data, squiggle.img.data));
    imgcont.appendChild(
      formButton(squiggle, "remove", "/admin/delete/completedsquiggle/")
    );
    imgcont.appendChild(
      formButton(squiggle, "restore", "/admin/undoreport/completedsquiggle/")
    );
    cont.insertBefore(imgcont, loader);
  });
}

const drawFromPoints = (collection, strokecolour, ctx) => {
  ctx.strokeStyle = strokecolour;
  ctx.lineWidth = "6";

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

async function loadSquiggles() {
  const fetchSquiggles = async () => {
    const response = await fetch("/admin/removedsquiggles");
    const json = await response.json();
    return json;
  };

  async function addCanvas(squiggle) {
    let canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.border = "1px solid";
    let ctx = canvas.getContext("2d");
    let line = await JSON.parse(squiggle.line);

    drawFromPoints(line, "blue", ctx);
    return canvas;
  }

  let squiggles = await fetchSquiggles();

  if (squiggles.length == 0) {
    loader2.innerHTML = "no squiggles reported";
  }
  squiggles.forEach(async squiggle => {
    let imgcont = document.createElement("div");
    let canvas = await addCanvas(squiggle);
    imgcont.appendChild(canvas);

    imgcont.appendChild(
      formButton(squiggle, "remove", "/admin/delete/squiggle/")
    );
    imgcont.appendChild(
      formButton(squiggle, "restore", "/admin/undoreport/squiggle/")
    );
    squigCont.insertBefore(imgcont, loader2);
  });
}

async function loadAllSquiggles() {
  const fetchSquiggles = async () => {
    const response = await fetch("/admin/allsquiggles");
    const json = await response.json();
    return json;
  };

  async function addCanvas(squiggle) {
    let canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.border = "1px solid";
    let ctx = canvas.getContext("2d");
    let line = await JSON.parse(squiggle.line);

    drawFromPoints(line, "blue", ctx);
    return canvas;
  }

  let squiggles = await fetchSquiggles();

  if (squiggles.length == 0) {
    loader2.innerHTML = "squiggles all good";
  }
  squiggles.forEach(async squiggle => {
    let imgcont = document.createElement("div");
    let canvas = await addCanvas(squiggle);
    imgcont.appendChild(canvas);

    imgcont.appendChild(
      formButton(squiggle, "remove", "/admin/delete/squiggle/")
    );
    imgcont.appendChild(
      formButton(squiggle, "restore", "/admin/undoreport/squiggle/")
    );
    squigAllCont.insertBefore(imgcont, loader3);
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

toTopObserver.observe(homeButton);
