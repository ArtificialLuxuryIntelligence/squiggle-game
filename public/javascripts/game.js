// const copyIdButton = document.getElementById("copyId");
// copyIdButton.addEventListener("click", () => {
//   saveToClipboard("gameId");
// });

const copyLinkButton = document.getElementById("copyLink");
copyLinkButton.addEventListener("click", () => {
  saveToClipboard("gameLink");
});

function saveToClipboard(id) {
  /* Get the text field */
  console.log(id);
  let el = document.getElementById(id);
  let value = el.innerText;
  console.log(value);

  let temp = document.createElement("input");
  temp.setAttribute("value", value);
  document.body.appendChild(temp);

  /* Select the text field */
  temp.select();
  temp.setSelectionRange(0, 99999); /*For mobile devices*/

  /* Copy the text inside the text field */
  document.execCommand("copy");

  /* Alert the copied text */
  alert("Copied: " + value);
}

///load latest squiggle

const cont = document.getElementById("imgCont");
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

  // console.log(pageNum);
  // console.log(squiggles);
}

loadImage();

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
