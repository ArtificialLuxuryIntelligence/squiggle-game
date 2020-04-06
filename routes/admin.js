var express = require("express");
var router = express.Router();

const auth = require("./middleware/auth");

const Squiggle = require("../models/squiggle");
const CompletedSquiggle = require("../models/completeSquiggle");
const User = require("../models/user");

router.get("/", auth, function (req, res, next) {
  res.render("admin");
});

router.get("/removedcompletedsquiggles", auth, async (req, res, next) => {
  //   let page = req.params.page;
  let squiggles = await CompletedSquiggle.find({ reports: { $gt: 0 } }).sort({
    time: -1,
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

router.get("/removedsquiggles", auth, async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await Squiggle.find({ reports: { $gt: 0 } }).sort({
    time: -1,
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

router.get("/allsquiggles", auth, async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await Squiggle.find().sort({
    time: -1,
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

router.post("/undoreport/completedsquiggle/:id", auth, (req, res) => {
  CompletedSquiggle.update(
    { _id: req.params.id },
    { reports: 0 },
    (err, doc) => {
      if (err) {
        // res.redirect("/admin");
        console.log(err);
      }
      if (doc) {
        // res.redirect("/admin");
      }
    }
  );
});

router.post("/delete/completedsquiggle/:id", auth, (req, res) => {
  CompletedSquiggle.findByIdAndDelete({ _id: req.params.id }, (err, doc) => {
    if (err) {
      // res.redirect("/admin");
      console.log(err);
    }
    if (doc) {
      // res.redirect("/admin");
      console.log(doc);
    }
  });
});

router.post("/undoreport/squiggle/:id", auth, (req, res) => {
  Squiggle.update({ _id: req.params.id }, { reports: 0 }, (err, doc) => {
    if (err) {
      // res.redirect("/admin");
      console.log(err);
    }
    if (doc) {
      // res.redirect("/admin");
      console.log(doc);
    }
  });
});

router.post("/delete/squiggle/:id", auth, (req, res) => {
  Squiggle.findByIdAndDelete({ _id: req.params.id }, (err, doc) => {
    if (err) {
      // res.redirect("/admin");
      console.log(err);
    }
    if (doc) {
      // res.redirect("/admin");
      console.log(doc);
    }
  });
});

module.exports = router;
