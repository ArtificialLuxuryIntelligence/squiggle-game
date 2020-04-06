console.log("login page");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

//not needed with sessions

// loginForm.addEventListener("submit", e => {
//   e.preventDefault();
//   let body = {
//     name: e.target.name.value,
//     password: e.target.password.value
//   };

//   fetch("/login/login", {
//     method: "POST",
//     body: JSON.stringify(body),
//     headers: {
//       "Content-Type": "application/json"
//     }
//   })
//     .then(res => res.json())
//     .then(data => {
//       console.log("redirecting");
//       if (data.token) {
//         localStorage.setItem("token", data.token);
//         window.location.href = "/admin";
//       } else {
//         window.location.href = "/";
//       }
//     })

//     .catch(err => {
//       console.log(err);
//     });
// });
