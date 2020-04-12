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

router.post("/joingame/:id", async (req, res) => {
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
                res.redirect("/account");
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

router.post(
  "/login",
  passport.authenticate("local.signin", {
    successRedirect: "/admin",
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
