const express = require("express");
const router = express.Router();

const Squiggle = require("../models/squiggle");
const CompletedSquiggle = require("../models/completeSquiggle");
const User = require("../models/user");
const Game = require("../models/game");

const loggedIn = require("./middleware/loggedIn");
const myTurn = require("./middleware/myTurn");

router.use("/", myTurn, (req, res, next) => {
  // console.log("SESSION", req.session);
  // console.log("USER", req.user);
  next();
});

router.get("/", function (req, res, next) {
  console.log(req.user);

  let isAdmin;
  //not in private game
  req.session.gameId = null;
  req.session.gameName = null;
  req.session.myTurn = null;

  // req.session.squiggleId = null;

  // console.log("session", req.session);
  let waitingGames = req.session.waitingGames;

  if (req.user) {
    isAdmin = req.user.isAdmin;
  }

  if (req.session && !req.session.animate) {
    req.session.animate = true;

    res.render("index", {
      animate: false,
      user: req.user,
      waitingGames,
      isAdmin,
    });
  } else {
    // console.log(req.user);

    res.render("index", {
      animate: true,
      user: req.user,
      waitingGames,
      isAdmin,
    });
  }
});

//home page with no animation
router.get("/home", myTurn, function (req, res, next) {
  req.session.animate = false;

  return res.redirect("/");
});

router.get("/login", loggedIn, (req, res) => {
  let messages = req.flash("error");
  res.render("login", { hasErrors: messages.length > 0, messages });
});

//////////

//report

router.post("/report/completedsquiggle/:id", (req, res) => {
  CompletedSquiggle.update(
    { _id: req.params.id },
    { $inc: { reports: 1 } },
    (err, doc) => {
      if (err) {
        res.redirect("/gallery");
        console.log(err);
      }
      if (doc) {
        res.redirect("/gallery");
        console.log(doc);
      }
    }
  );
});

router.post("/report/squiggle/:id", (req, res) => {
  Squiggle.update(
    { _id: req.params.id },
    { $inc: { reports: 1 } },
    (err, doc) => {
      if (err) {
        res.redirect("/play");
        console.log(err);
      }
      if (doc) {
        res.redirect("/play");
        console.log(doc);
      }
    }
  );
});

module.exports = router;
