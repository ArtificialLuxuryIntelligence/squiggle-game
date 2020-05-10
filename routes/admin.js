var express = require("express");
var router = express.Router();

const isAdmin = require("./middleware/isAdmin");

const Squiggle = require("../models/squiggle");
const CompletedSquiggle = require("../models/completeSquiggle");
const User = require("../models/user");

//protect all admin routes
router.use("/", isAdmin, (req, res, next) => {
  next();
});

router.get("/", function (req, res, next) {
  res.render("admin", { name: req.user.name });
});

// Returns all completed squiggles that have been reported (more than 0 times)
router.get("/removedcompletedsquiggles", async (req, res, next) => {
  //   let page = req.params.page;
  let squiggles = await CompletedSquiggle.find({ reports: { $gt: 0 } }).sort({
    time: -1,
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

// Returns all squiggles that have been reported (more than 0 times)

router.get("/removedsquiggles", async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await Squiggle.find({ reports: { $gt: 0 } }).sort({
    time: -1,
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

// Returns ALL squiggles

router.get("/allsquiggles", async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await Squiggle.find().sort({
    time: -1,
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

//Resets reports to 0 of completed squiggle

router.post("/undoreport/completedsquiggle/:id", (req, res) => {
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

// Deletes completed squiggle

router.delete("/delete/completedsquiggle/:id", (req, res) => {
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

//Resets reports to 0 of squiggle

router.post("/undoreport/squiggle/:id", (req, res) => {
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

// Deletes squiggle

router.delete("/delete/squiggle/:id", (req, res) => {
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
