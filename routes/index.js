const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const session = require("express-session");
const router = express.Router();

const Squiggle = require("../models/squiggle");
const CompletedSquiggle = require("../models/completeSquiggle");
const User = require("../models/user");

/* GET home page. */
router.get("/", function(req, res, next) {
  if (req.app.get("animate") && req.app.get("animate").animate === false) {
    req.app.set("animate", { animate: true });

    res.render("index", { animate: false });
  }
  res.render("index", { animate: true });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login/login", (req, res) => {
  User.find({ name: req.body.name })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "login failed"
        });
      } else {
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "login failed" //same fail msg as above for security
            });
          }
          if (result) {
            const token = jwt.sign(
              { name: user.name, id: user._id },
              process.env.JWT_KEY,
              {
                expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "login successful",
              token
            });
          }
          return res.status(401).json({
            message: "login failed"
          });
        });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    });
});

//only used for creating users
router.post("/login/signup", (req, res) => {
  User.find({ name: req.body.name })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "name taken"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              name: req.body.name,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

//home page with no animation
router.get("/home", function(req, res, next) {
  req.app.set("animate", { animate: false });
  return res.redirect("/");
});

router.get("/gallery", function(req, res, next) {
  res.render("gallery");
});

// router.get("/gallery/squiggles", async (req, res, next) => {
//   let squiggles = await CompletedSquiggle.find({})
//     .sort({ time: -1 })
//     .limit(20);
//   res.json(squiggles);
// });

router.get("/gallery/squiggles/:page", async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await CompletedSquiggle.find({ reports: { $lt: 1 } })
    .sort({ time: -1 })
    .skip(parseInt(page) * 5)
    .limit(5);
  res.json(squiggles);
});

router.get("/play", function(req, res, next) {
  res.render("game", { newsquiggle: false });
});

router.get("/play/squiggle", async (req, res, next) => {
  const numSquiggles = await Squiggle.countDocuments({ reports: { $lt: 1 } });
  let rand = Math.floor(Math.random() * numSquiggles);

  let squiggle = await Squiggle.findOne({ reports: { $lt: 1 } }).skip(rand);
  res.json(squiggle);
});

router.get("/newsquiggle", function(req, res, next) {
  res.render("game", { newsquiggle: true });
});

router.post("/newsquiggle/submit", function(req, res, next) {
  let squiggle = new Squiggle({
    line: req.body.data,
    size: req.body.originalSize
  });
  squiggle.save(err => {
    if (err) {
      next(err);
    }
    res.redirect("/home");
  });
});

router.post("/play/submit", function(req, res, next) {
  let squiggle = new CompletedSquiggle({
    author: "completer",
    img: {
      data: req.body.data,
      contentType: "image/png"
    },
    img2: {
      data: req.body.png,
      contentType: "image/png"
    }
  });
  squiggle.save(err => {
    if (err) {
      next(err);
    }
    res.redirect("/newsquiggle");
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
//admin

//middleware
// function auth(req, res, next) {
//   console.log("locals rec", req.isLoggedIn);

//   let isLoggedIn = req.locals.isLoggedIn;
//   if (isLoggedIn) {
//     next();
//   } else {
//     redirect("/");
//   }
// }

// router.get("/login", (req, res) => {
//   res.render("login");
// });

// router.post("/admin/login", function(req, res, next) {
//   let valid = req.body.password === "asdf" ? true : false;
//   res.locals.isLoggedIn = valid;
//   console.log("LOCALS", res.locals.isLoggedIn);

//   if (valid) {
//     res.redirect("/admin");
//   } else {
//     res.redirect("/");
//   }
// });

module.exports = router;
