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

router.post("/join/:id", async (req, res) => {
  let username = req.user.name;
  let gameId = req.params.id;

  Game.findOne({ _id: gameId }, async (err, game) => {
    if (err) {
      res.redirect("/");
    }
    if (!game) {
      req.flash("msg", "no game");
      res.redirect("/users/account");
      return;
    }
    if (game.players.includes(username)) {
      console.log("already in game");

      res.redirect(`/game/${game.id}`);
    } else {
      let game = await Game.findOne({ _id: gameId });

      //adding player will mess up modulo for turn tracking
      //reset turn number

      let turn, turnName;
      if (game.players.length == 1) {
        turn = game.turn; //already inc to 1
        turnName = req.user.name; // user now at index 1
        console.log(turn, turnName);
      } else {
        turn = game.players.indexOf(game.turnName);
        turnName = game.turnName;
      }

      Game.findOneAndUpdate(
        { _id: gameId },
        //add user to game
        { $push: { players: req.user.name }, turn: turn, turnName: turnName },
        (err, game) => {
          if (err) {
            req.flash("msg", "Can't find game");
            res.redirect("/users/account");
            console.log(err);
            return;
          }
          if (!game) {
            req.flash("msg", "no game");
            res.redirect("/users/account");
            return;
          }
          //there is a game with that id
          //add game id to user profile and redirect
          User.findOneAndUpdate(
            { _id: req.user.id },
            { $push: { games: { id: game.id, name: game.name } } },
            (err, doc) => {
              if (err) {
                //user data??->
                res.redirect("/users/account");
                console.log(err);
              }
              if (doc) {
                res.redirect(`/game/${game.id}`);
                // console.log(doc);
              }
            }
          );
        }
      );
    }
  });
});

router.get("/join", auth, (req, res) => {
  res.render("account", {
    messages: req.flash("msg"),
    user: req.user,
    joinId: req.query.id,
  });
});

router.get("/:id", auth, function (req, res, next) {
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

router.post("/new", auth, (req, res, next) => {
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
          res.redirect("/play/newsquiggle");
        }
      }
    );
  });
});

module.exports = router;
