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

router.use("/", myTurn, (req, res, next) => {
  console.log("SESSION", req.session);
  console.log("USER", req.user);

  next();
});

router.get("/", function (req, res, next) {
  //not in private game
  req.session.gameId = null;
  req.session.gameName = null;
  req.session.myTurn = null;

  // req.session.squiggleId = null;

  // console.log("session", req.session);
  let waitingGames = req.session.waitingGames;

  if (req.session && !req.session.animate) {
    req.session.animate = true;

    res.render("index", { animate: false, user: req.user, waitingGames });
  } else {
    // console.log(req.user);

    res.render("index", { animate: true, user: req.user, waitingGames });
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
  if (!req.session.gameId) {
    res.render("gallery");
  } else {
    let gameName = req.session.gameName;
    let gameId = req.session.gameId;
    res.render("gallery", { gameName: gameName, gameId });
  }
});

router.get("/gallery/squiggles/:page", async (req, res, next) => {
  let page = req.params.page;

  if (!req.session.gameId) {
    let squiggles = await CompletedSquiggle.find({ reports: { $lt: 1 } })
      .sort({ time: -1 })
      .skip(parseInt(page) * 5)
      .limit(5);
    res.json(squiggles);
  } else {
    let gameId = req.session.gameId;
    let squiggles = await CompletedSquiggle.find({
      reports: { $lt: 1 },
      gameId,
    })
      .sort({ time: -1 })
      .skip(parseInt(page) * 5)
      .limit(5);
    res.json(squiggles);
  }
});

router.get("/gallery/latest", async (req, res, next) => {
  let squiggle = await CompletedSquiggle.find({ gameId: req.session.gameId })
    .sort({ time: -1 })
    .limit(1);
  res.json(squiggle);
});

//sets  game data in session
router.get("/play/private", function (req, res, next) {
  console.log(req.query);

  req.session.gameId = req.query.gameid;
  req.session.squiggleId = req.query.squiggleid;

  console.log("REDIRECTING");

  return res.redirect("/play");
});

router.get("/play", function (req, res, next) {
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

router.get("/play/squiggle", async (req, res, next) => {
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
      console.log("latest");

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

router.post("/play/submit", (req, res, next) => {
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

      res.redirect("/newsquiggle");
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
        res.redirect("/newsquiggle");
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
        console.log("UPDATING GAME OBJECT");
        let gameId = req.session.gameId;
        try {
          let game = await Game.findOne({ _id: gameId });
          // console.log("GAAAAAAAAAAAME", game.turn, game.players);
          let turnName = game.players[(game.turn + 1) % game.players.length];

          await Game.update({ _id: gameId }, { $inc: { turn: 1 }, turnName });
          req.session.myTurn = false;
          res.redirect(`/game/${gameId}`);
        } catch (err) {
          console.log("game update error", err);
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

router.get("/join", auth, (req, res) => {
  res.render("account", {
    messages: req.flash("msg"),
    user: req.user,
    joinId: req.query.id,
  });
});

router.get("/game/:id", auth, function (req, res, next) {
  // console.log(req.user);
  let id = req.params.id;
  console.log("entering new game");

  req.session.gameId = id;
  req.session.gameName = null; //added when game is fetched
  req.session.squiggleId = null;
  req.session.myTurn = null;
  Game.findOne({ _id: id }, function async(err, game) {
    if (err) {
      res.render("account", { message: "error", user: req.user });
    }
    if (!game) {
      console.log("NO GAME");
      return res.redirect("/");
    }

    //game found

    req.session.gameId = id;
    req.session.gameName = game.name;

    if (game.players.length === 1) {
      res.render("game", {
        user: req.user,
        game: game,
        noPlayers: true,
      });
    } else {
      const totalPlayers = game.players.length;
      game.currentPlayer = game.players[game.turn % totalPlayers];

      let myTurn = {};
      if (game.currentPlayer == req.user.name) {
        myTurn.bool = true;
        req.session.myTurn = true;
      } else {
        myTurn.bool = false;
      }
      console.log(game);

      // let lastSquiggle;

      // let latestCompletedSquiggle = await CompletedSquiggle.findOne({gameId:game._id})

      res.render("game", {
        game: game,
        user: req.user,
        myTurn: myTurn,
        noPlayers: false,
      });
    }
  });
});

router.post("/newgame", auth, (req, res, next) => {
  let newGame = new Game({
    admin: req.user.name,
    name: req.body.gamename,
    players: [req.user.name],
    turnName: req.user.name,
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
          req.session.gameId = game.id;
          res.redirect("/newsquiggle");
        }
      }
    );
  });
});

module.exports = router;
