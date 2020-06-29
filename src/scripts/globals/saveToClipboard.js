function saveToClipboard(id) {
  /* Get the text field */
  let el = document.getElementById(id);
  let value = el.innerText;
  let temp = document.createElement("input");
  temp.setAttribute("value", value);
  document.body.appendChild(temp);

  /* Select the text field */
  temp.select();
  temp.setSelectionRange(0, 99999); /*For mobile devices*/

  /* Copy the text inside the text field */
  document.execCommand("copy");
  temp.remove();

  /* Alert the copied text */
  alert("Copied: " + value);
}

export { saveToClipboard };
