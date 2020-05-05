import { saveToClipboard } from "../globals/saveToClipboard";

// const copyIdButton = document.getElementById("copyId");
// copyIdButton.addEventListener("click", () => {
//   saveToClipboard("gameId");
// });
const cont = document.getElementById("imgCont");
const copyLinkButton = document.getElementById("copyLink");

copyLinkButton.addEventListener("click", () => {
  saveToClipboard("game-link");
});

///load latest squiggle

//functions basically from gallery.js

async function loadImage() {
  const fetchSquiggle = async () => {
    const response = await fetch("/gallery/latest");
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
  }

  let [squiggle] = await fetchSquiggle();
  console.log(squiggle);

  let imgcont = document.createElement("div");
  let title = document.createElement("h3");
  title.innerText = "Latest superb squiggle solution";
  imgcont.appendChild(title);
  imgcont.appendChild(addImage(squiggle.img2.data, squiggle.img.data));

  let author = document.createElement("p");
  author.innerText = squiggle.author;
  author.setAttribute("class", "author-tag");
  imgcont.appendChild(author);
  cont.appendChild(imgcont);
}

loadImage();

/// open delete modal;

let modal = document.querySelector("#delete-modal");
let modalNo = modal.querySelector("#close-modal");
modalNo.addEventListener("click", (e) => {
  e.preventDefault();
  toggleModal();
});
document.querySelector("#modal-toggle").addEventListener("click", toggleModal);

function toggleModal() {
  if (modal.style.display == "block") {
    modal.style.display = "none";
  } else {
    modal.style.display = "block";
  }
}
//////////////

//////////////

// PUSH NOTIFICATIONS TEST

// console.log("notifications");

// if (window.Notification && Notification.permission !== "denied") {
//   Notification.requestPermission((status) => {
//     // status is "granted", if accepted by user
//     var n = new Notification("Title", {
//       body: "I am the body text!",
//       // icon: "/path/to/icon.png", // optional
//     });
//   });
// }
// n.close();
