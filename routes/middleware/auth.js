// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   try {
//     console.log(req.headers);

//     const token = req.headers.authorization.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_KEY);
//     req.userData = decoded; // add user data to passed on requests
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       message: "auth failed"
//     });
//   }
// };

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
};
