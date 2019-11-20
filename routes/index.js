var express = require("express");
var router = express.Router();

var Squiggle = require("../models/squiggle");
var CompletedSquiggle = require("../models/completeSquiggle");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index");
});

router.get("/gallery", function(req, res, next) {
  res.render("gallery");
});

router.get("/gallery/squiggles", async (req, res, next) => {
  let squiggles = await CompletedSquiggle.find({}).sort({ time: -1 });
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
    line: req.body.data
  });
  squiggle.save(err => {
    if (err) {
      next(err);
    }
    res.redirect("/");
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
