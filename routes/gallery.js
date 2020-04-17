const express = require("express");

const router = express.Router();

const CompletedSquiggle = require("../models/completeSquiggle");

router.get("/", function (req, res, next) {
  if (!req.session.gameId) {
    res.render("gallery");
  } else {
    let gameName = req.session.gameName;
    let gameId = req.session.gameId;
    res.render("gallery", { gameName: gameName, gameId });
  }
});

router.get("/squiggles/:page", async (req, res, next) => {
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

router.get("/latest", async (req, res, next) => {
  let squiggle = await CompletedSquiggle.find({ gameId: req.session.gameId })
    .sort({ time: -1 })
    .limit(1);
  res.json(squiggle);
});

module.exports = router;
