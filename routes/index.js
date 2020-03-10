var express = require("express");
var session = require("express-session");

var router = express.Router();

var Squiggle = require("../models/squiggle");
var CompletedSquiggle = require("../models/completeSquiggle");

/* GET home page. */
router.get("/", function(req, res, next) {
  if (req.app.get("animate") && req.app.get("animate").animate === false) {
    req.app.set("animate", { animate: true });

    res.render("index", { animate: false });
  }
  res.render("index", { animate: true });
});

//home page with no animation
router.get("/home", function(req, res, next) {
  req.app.set("animate", { animate: false });
  return res.redirect("/");
});

router.get("/gallery", function(req, res, next) {
  res.render("gallery");
});

router.get("/gallery/squiggles", async (req, res, next) => {
  let squiggles = await CompletedSquiggle.find({})
    .sort({ time: -1 })
    .limit(20);
  res.json(squiggles);
});

router.get("/gallery/squiggles/:page", async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await CompletedSquiggle.find({})
    .sort({ time: -1 })
    .skip(parseInt(page) * 5)
    .limit(5);
  res.json(squiggles);
});

router.get("/play", function(req, res, next) {
  res.render("game", { newsquiggle: false });
});

router.get("/play/squiggle", async (req, res, next) => {
  const numSquiggles = await Squiggle.estimatedDocumentCount();
  let rand = Math.floor(Math.random() * numSquiggles);
  let squiggle = await Squiggle.findOne().skip(rand);
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

module.exports = router;
