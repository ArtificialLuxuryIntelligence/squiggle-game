var express = require("express");
var router = express.Router();
const passport = require("passport");

const User = require("../models/user");
const Game = require("../models/game");

//LOGGED IN ROUTES // router.use auth
router.get("/account", function (req, res, next) {
  let waitingGames = req.session.waitingGames;

  res.render("account", {
    messages: req.flash("msg"),
    user: req.user,
    waitingGames,
  });
});

router.post(
  "/login",
  passport.authenticate("local.signin", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

//bad name
router.post(
  "/signup",
  passport.authenticate("local.signup", {
    successRedirect: "/login",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", function (req, res, next) {
  req.session.destroy();
  req.logout();
  return res.redirect("/");
});

module.exports = router;
