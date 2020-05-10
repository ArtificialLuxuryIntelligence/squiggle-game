const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Game = require("../models/game");

const auth = require("./middleware/auth");

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
  console.log(`entering game ${id}`);

  req.session.gameId = id;
  req.session.gameName = null; //added when game is fetched
  req.session.squiggleId = null;
  req.session.myTurn = null;
  Game.findOne({ _id: id }, function async(err, game) {
    if (err) {
      res.render("account", { message: "error", user: req.user });
    }

    // game not found

    if (!game) {
      console.log("NO GAME");
      User.findOneAndUpdate(
        { _id: req.user.id },
        { $pull: { games: { id: id } } },
        (err, doc) => {
          if (err) {
            //user data??->
            console.log("", err);
            return res.redirect("/users/account");
          }
          if (doc) {
            console.log("doc", doc);

            return res.redirect("/users/account");
          }
        }
      );
      return;
    }

    //game found

    req.session.gameId = id;
    req.session.gameName = game.name;
    let gameAdmin = game.admin == req.user.name;

    if (game.players.length === 1) {
      res.render("game", {
        gameAdmin: gameAdmin,

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
      console.log("GAME", game);

      // let lastSquiggle;

      // let latestCompletedSquiggle = await CompletedSquiggle.findOne({gameId:game._id})

      res.render("game", {
        gameAdmin: gameAdmin,
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

router.post("/delete/:id", auth, (req, res, next) => {
  // console.log(req.user.id);

  const gameId = req.params.id;
  const userId = req.user.id;

  Game.findByIdAndDelete(gameId, (err, doc) => {
    if (err) {
      console.log(err);

      res.redirect("/users/account");
    } else {
      User.findOneAndUpdate(
        { _id: req.user.id },
        { $pull: { games: { id: gameId } } },
        (err, doc) => {
          if (err) {
            //user data??->
            res.redirect("/users/account");
            console.log(err);
          }
          if (doc) {
            console.log("doc", doc);

            res.redirect("/users/account");
          }
        }
      );
    }
  });
});

module.exports = router;
