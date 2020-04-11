const express = require("express");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const session = require("express-session");
const router = express.Router();

const Squiggle = require("../models/squiggle");
const CompletedSquiggle = require("../models/completeSquiggle");
const User = require("../models/user");
const Game = require("../models/game");

const loggedIn = require("./middleware/loggedIn");

router.get("/", function (req, res, next) {
  //not in private game
  req.session.gameId = null;
  req.session.squiggleId = null;

  // console.log("session", req.session);

  if (req.session && !req.session.animate) {
    req.session.animate = true;

    res.render("index", { animate: false, user: req.user });
  } else {
    // console.log(req.user);

    res.render("index", { animate: true, user: req.user });
  }
});

//home page with no animation
router.get("/home", function (req, res, next) {
  req.session.animate = false;

  return res.redirect("/");
});

router.get("/login", loggedIn, (req, res) => {
  let messages = req.flash("error");
  res.render("login", { hasErrors: messages.length > 0, messages });
});

//////////

//MAYBE if(!req.sess)etc
router.get("/gallery", function (req, res, next) {
  res.render("gallery");
});

// router.get("/gallery/squiggles", async (req, res, next) => {
//   let squiggles = await CompletedSquiggle.find({})
//     .sort({ time: -1 })
//     .limit(20);
//   res.json(squiggles);
// });

//if(!req.sess)etc
router.get("/gallery/squiggles/:page", async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await CompletedSquiggle.find({ reports: { $lt: 1 } })
    .sort({ time: -1 })
    .skip(parseInt(page) * 5)
    .limit(5);
  res.json(squiggles);
});

//sets private game data in session
router.get("/play/private", function (req, res, next) {
  console.log(req.query);

  req.session.gameId = req.query.gameid;
  req.session.squiggleId = req.query.squiggleid;

  console.log("REDIRECTING");

  return res.redirect("/play");
});

//if(!req.sess)etc

router.get("/play", function (req, res, next) {
  if (!req.session.gameId) {
    res.render("play", { newsquiggle: false });
  } else {
    let gameId = req.session.gameId;

    //USE gameId for changing submit form action
    res.render("play", { newsquiggle: false, gameId: gameId });
  }
});

//if(!req.sess)etc

router.get("/play/squiggle", async (req, res, next) => {
  console.log("sess", req.session);

  //no specific squiggle given
  if (!req.session.squiggleId || req.session.squiggleId == "random") {
    const numSquiggles = await Squiggle.countDocuments({ reports: { $lt: 1 } });
    let rand = Math.floor(Math.random() * numSquiggles);

    let squiggle = await Squiggle.findOne({ reports: { $lt: 1 } }).skip(rand);
    res.json(squiggle);
  } else {
    //find specific squiggle
    try {
      let squiggle = await Squiggle.findById(req.session.squiggleId);
      res.json(squiggle);
    } catch (err) {
      console.log(err);
    }
  }
});

// set to also accepts query string?
router.post("/play/submit", function (req, res, next) {
  let squiggle = new CompletedSquiggle({
    author: "completer",
    img: {
      data: req.body.data,
      contentType: "image/png",
    },
    img2: {
      data: req.body.png,
      contentType: "image/png",
    },
  });
  squiggle.save((err) => {
    if (err) {
      next(err);
    }
    res.redirect("/newsquiggle");
  });
});

//if(!req.sess)etc

router.get("/newsquiggle", function (req, res, next) {
  res.render("play", { newsquiggle: true });
});

// set to also accepts query string?

router.post("/newsquiggle/submit", function (req, res, next) {
  let squiggle = new Squiggle({
    line: req.body.data,
    size: req.body.originalSize,
  });
  squiggle.save((err) => {
    if (err) {
      next(err);
    }
    res.redirect("/home");
  });
});

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FRIEND GAME ROUTES

router.get("/game/:id", function (req, res, next) {
  // console.log(req.user);
  let id = req.params.id;
  console.log("id", id);

  Game.findOne({ _id: id }, function (err, game) {
    if (err) {
      res.render("account", { message: "error", user: req.user });
    }
    if (!game) {
      console.log("NO GAME");
      return res.redirect("/");
    }

    //game found

    //save some game data in session?

    game.currentPlayer = game.players[game.turn];
    let myTurn = {};
    if (game.currentPlayer == req.user.name) {
      myTurn.bool = true;

      //last squiggle in game.squiggles array.
      myTurn.squiggle = 4365646;
    } else {
      myTurn.bool = false;
    }

    res.render("game", { game: game, myTurn: myTurn });
  });

  //db lookup for game
});

router.post("/newgame", (req, res, next) => {
  let newGame = new Game({
    admin: req.user.name,
    name: req.body.gamename,
    players: [req.user.name],
  });

  newGame.save(async (err, game) => {
    if (err) {
      console.log(err);

      next(err);
    }
    //add game to user

    console.log(game);

    User.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { games: { id: game.id, name: game.name } } },
      (err, doc) => {
        if (err) {
          //user data??->
          res.redirect("/account");
          console.log(err);
        }
        if (doc) {
          //CHANGE THIS:
          //SET GAME ID IN SESSION ; REDIRECT TO NEW SQUIGGLE THEN TO THIS REDIRECT BELOW
          res.redirect(`/game/${game.id}`);
          // console.log(doc);
        }
      }
    );
  });
});

module.exports = router;
