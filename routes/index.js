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

router.get("/admin", function(req, res, next) {
  res.render("admin", { loggedIn: true });
});

// VERY bad login just for now

// router.get("/admin", function(req, res, next) {
//   if (req.params.token && req.params.token === "secret") {
//     res.render("admin", { loggedIn: true });
//   }
//   res.render("admin");
// });

// router.post("/admin/login", (req, res) => {
//   if (req.body.password === "asdf") {
//     //send session
//     res.redirect("/admin");
//   }
//   res.redirect("/admin");
// });

router.get("/admin/removedcompletedsquiggles", async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await CompletedSquiggle.find({ reports: { $gt: 0 } }).sort({
    time: -1
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

router.get("/admin/removedsquiggles", async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await Squiggle.find({ reports: { $gt: 0 } }).sort({
    time: -1
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

router.get("/admin/allsquiggles", async (req, res, next) => {
  let page = req.params.page;

  let squiggles = await Squiggle.find().sort({
    time: -1
  });
  // .skip(parseInt(page) * 5)
  // .limit(5);
  res.json(squiggles);
});

router.post("/admin/undoreport/completedsquiggle/:id", (req, res) => {
  CompletedSquiggle.update(
    { _id: req.params.id },
    { reports: 0 },
    (err, doc) => {
      if (err) {
        res.redirect("/admin");
        console.log(err);
      }
      if (doc) {
        res.redirect("/admin");
      }
    }
  );
});

router.post("/admin/delete/completedsquiggle/:id", (req, res) => {
  CompletedSquiggle.findByIdAndDelete({ _id: req.params.id }, (err, doc) => {
    if (err) {
      res.redirect("/admin");
      console.log(err);
    }
    if (doc) {
      res.redirect("/admin");
      console.log(doc);
    }
  });
});

router.post("/admin/undoreport/squiggle/:id", (req, res) => {
  Squiggle.update({ _id: req.params.id }, { reports: 0 }, (err, doc) => {
    if (err) {
      res.redirect("/admin");
      console.log(err);
    }
    if (doc) {
      res.redirect("/admin");
      console.log(doc);
    }
  });
});

router.post("/admin/delete/squiggle/:id", (req, res) => {
  Squiggle.findByIdAndDelete({ _id: req.params.id }, (err, doc) => {
    if (err) {
      res.redirect("/admin");
      console.log(err);
    }
    if (doc) {
      res.redirect("/admin");
      console.log(doc);
    }
  });
});

module.exports = router;
