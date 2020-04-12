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
