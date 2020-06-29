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
const auth = require("./middleware/auth");
const myTurn = require("./middleware/myTurn");

router.get("/private", function (req, res, next) {
  // console.log(req.query);

  req.session.gameId = req.query.gameid;
  req.session.squiggleId = req.query.squiggleid;
  return res.redirect("/play");
});

router.get("/", function (req, res, next) {
  if (!req.session.gameId) {
    res.render("play", { newsquiggle: false });
  } else {
    // let gameId = req.session.gameId;
    let gameName = req.session.gameName;

    //USE gameId for changing submit form action
    res.render("play", { newsquiggle: false, gameName });
  }
});

//if(!req.sess)etc

router.get("/squiggle", async (req, res, next) => {
  // console.log("sess", req.session);

  //no specific squiggle given
  if (!req.session.squiggleId) {
    const numSquiggles = await Squiggle.countDocuments({ reports: { $lt: 1 } });
    let rand = Math.floor(Math.random() * numSquiggles);

    let squiggle = await Squiggle.findOne({ reports: { $lt: 1 } }).skip(rand);
    res.json(squiggle);
  } else if (req.session.squiggleId == "random") {
    let gameId = req.session.gameId;

    const numSquiggles = await Squiggle.countDocuments({ gameId: gameId });
    let rand = Math.floor(Math.random() * numSquiggles);

    let squiggle = await Squiggle.findOne({ gameId: gameId }).skip(rand);
    res.json(squiggle);
  } else {
    //find specific squiggle
    let gameId = req.session.gameId;
    try {
      let squiggle = await Squiggle.find({ gameId: gameId })
        .sort({
          time: -1,
        })
        .limit(1);

      res.json(...squiggle);
    } catch (err) {
      console.log(err);
    }
  }
});

router.post("/submit", (req, res, next) => {
  if (!req.session.gameId) {
    let author;
    req.user ? (author = req.user.name) : (author = "anon");

    let squiggle = new CompletedSquiggle({
      author: author,
      squiggleId: req.body.squiggleId,
      img: {
        data: req.body.data,
        contentType: "image/png",
      },
      img2: {
        data: req.body.png,
        contentType: "image/png",
      },
    });
    squiggle.save(async (err) => {
      if (err) {
        next(err);
      }

      res.redirect("newsquiggle");
    });
  } else {
    let author, gameId;
    req.user ? (author = req.user.name) : (author = "anon");
    gameId = req.session.gameId;

    let squiggle = new CompletedSquiggle({
      author: author,
      gameId: gameId,
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

      //new squiggle OR game home depending on if is your go?
      if (req.session.myTurn === true) {
        res.redirect("newsquiggle");
      } else {
        res.redirect(`/game/${gameId}`);
      }
    });
  }
});

router.get("/newsquiggle", function (req, res, next) {
  ////////
  if (!req.session.gameId) {
    res.render("play", { newsquiggle: true });
  } else {
    let gameId = req.session.gameId;
    res.render("play", { newsquiggle: true, gameId });
  }
});

// set to also accepts query string?

router.post("/newsquiggle/submit", function (req, res, next) {
  //if query string // add author //gameId

  /////
  if (!req.session.gameId) {
    let author;
    req.user ? (author = req.user.name) : (author = "anon");

    let squiggle = new Squiggle({
      author: author,
      line: req.body.data,
      size: req.body.originalSize,
    });
    squiggle.save((err) => {
      if (err) {
        next(err);
      }
      res.redirect("/home");
    });
  } else {
    let author, gameId;
    author = req.user.name;
    gameId = req.session.gameId;

    let squiggle = new Squiggle({
      author: author,
      gameId: gameId,
      line: req.body.data,
      size: req.body.originalSize,
    });
    squiggle.save(async (err) => {
      if (err) {
        next(err);
      }
      if ((req.session.myTurn = true)) {
        // console.log("UPDATING GAME OBJECT");
        let gameId = req.session.gameId;
        try {
          let game = await Game.findOne({ _id: gameId });
          // console.log("Game", game.turn, game.players);
          let turnName = game.players[(game.turn + 1) % game.players.length];

          await Game.update({ _id: gameId }, { $inc: { turn: 1 }, turnName });
          req.session.myTurn = false;
          res.redirect(`/game/${gameId}`);
        } catch (err) {
          // console.log("game update error", err);
          return res.redirect("/");
        }

        // console.log(doc);
      } else {
        console.log("error");
        res.redirect("/");
      }

      //update game ++
    });
  }
});

module.exports = router;
