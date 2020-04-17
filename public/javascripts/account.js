const joinGameForm = document.getElementById("join-game");

joinGameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(e.target.id.value);
  e.target.setAttribute("action", `/game/join/${e.target.id.value}`);
  e.target.submit();
});
