import { drawFromPoints } from "../components/canvas/drawFromPoints";

const cont = document.getElementById("gallery-container");
const squigCont = document.getElementById("squiggle-container");
const squigAllCont = document.getElementById("allsquiggle-container");

const loader = document.getElementById("loader");
const loader2 = document.getElementById("loader2");
const loader3 = document.getElementById("loader3");

const pageCont = document.querySelector(".container");

window.onload = async function () {
  await loadImages();
  await loadSquiggles();
  // addHeaders();
};

const ajaxButton = (squiggle, buttonValue, action, method = "POST") => {
  let i = document.createElement("button");
  i.innerText = buttonValue;
  i.addEventListener("click", async () => {
    console.log("clicked");
    const response = await fetch(action + squiggle._id, {
      method: method,
    });
    const json = await response.json();
    //server currently not send anything useful back..
    console.log(json);
  });
  return i;
};

//fetch squiggle

async function loadImages() {
  const fetchSquiggles = async () => {
    // const response = await fetch("/admin/removedcompletedsquiggles");
    const response = await fetch("/admin/removedcompletedsquiggles", {
      method: "GET",
    });
    const json = await response.json();
    if (json.message == "auth failed") {
      window.location.href = "/";
    }
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

  squiggles.forEach((squiggle) => {
    let imgcont = document.createElement("div");
    imgcont.appendChild(addImage(squiggle.img2.data, squiggle.img.data));
    imgcont.appendChild(
      ajaxButton(
        squiggle,
        "remove",
        "/admin/delete/completedsquiggle/",
        "DELETE"
      )
    );
    imgcont.appendChild(
      ajaxButton(squiggle, "restore", "/admin/undoreport/completedsquiggle/")
    );
    cont.insertBefore(imgcont, loader);
  });
}

async function loadSquiggles() {
  const fetchSquiggles = async () => {
    // const response = await fetch("/admin/removedsquiggles");
    const response = await fetch("/admin/removedsquiggles", {
      method: "GET",
    });
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

    drawFromPoints(ctx, line, "blue");
    return canvas;
  }

  let squiggles = await fetchSquiggles();

  if (squiggles.length == 0) {
    loader2.innerHTML = "no squiggles reported";
  }
  await squiggles.forEach(async (squiggle) => {
    let imgcont = document.createElement("div");
    let canvas = await addCanvas(squiggle);
    imgcont.appendChild(canvas);

    imgcont.appendChild(
      ajaxButton(squiggle, "remove", "/admin/delete/squiggle/", "DELETE")
    );
    imgcont.appendChild(
      ajaxButton(squiggle, "restore", "/admin/undoreport/squiggle/")
    );
    squigCont.insertBefore(imgcont, loader2);
  });
}

async function loadAllSquiggles() {
  const fetchSquiggles = async () => {
    // const response = await fetch("/admin/allsquiggles");
    const response = await fetch("/admin/allsquiggles", {
      method: "GET",
    });
    const json = await response.json();
    console.log(json);

    return json;
  };

  async function addCanvas(squiggle) {
    let canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.border = "1px solid";
    let ctx = canvas.getContext("2d");
    let line = await JSON.parse(squiggle.line);
    drawFromPoints(ctx, line, "blue");
    return canvas;
  }

  let squiggles = await fetchSquiggles();

  if (squiggles.length == 0) {
    loader2.innerHTML = "squiggles all good";
    return;
  }
  await (async () => {
    squiggles.forEach(async (squiggle) => {
      let imgcont = document.createElement("div");
      let canvas = await addCanvas(squiggle);
      imgcont.appendChild(canvas);
      imgcont.appendChild(
        ajaxButton(squiggle, "remove", "/admin/delete/squiggle/", "DELETE")
      );
      imgcont.appendChild(
        ajaxButton(squiggle, "restore", "/admin/undoreport/squiggle/")
      );
      let forms = imgcont.querySelectorAll("form");
      forms.forEach((form) => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          let action = e.target.action;
          fetch(action, {
            method: "POST",
          });
        });
      });

      squigAllCont.insertBefore(imgcont, loader3);
    });
  })();
  // addHeaders();
}

// add auth headers to all button API calls
// const addHeaders = () => {
//   let forms = document.querySelectorAll("form");

//   forms.forEach((form) => {
//     console.log(form);
//     form.addEventListener("submit", (e) => {
//       e.preventDefault();
//       let action = e.target.action;
//       fetch(action, {
//         method: "POST",
//       });
//     });
//   });
// };

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
  rootMargin: "300px",
};

const homeButton = document.querySelector("#home-link");
const loadAllButton = document.getElementById("load");

loadAllButton.addEventListener("click", loadAllSquiggles);

let toTopObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) =>
    entry.isIntersecting ? hideScrollToTop() : showScrollToTop()
  );
}, toTopOptions);

toTopObserver.observe(homeButton);
