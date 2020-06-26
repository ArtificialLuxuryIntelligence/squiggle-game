var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var logger = require("morgan");
// var mongodb = require("mongodb");
var mongoose = require("mongoose");
var passport = require("passport");
var session = require("express-session");
var flash = require("connect-flash");
var MongoStore = require("connect-mongo")(session);

var cors = require("cors");

require("./config/passport");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var galleryRouter = require("./routes/gallery");
var playRouter = require("./routes/play");
var gameRouter = require("./routes/game");

var app = express();
app.use(cors());

// connect to database
mongoose.connect(process.env.DB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// increased limit
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use(
  session({
    //TO DO .env this file
    secret: "very secret this is",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

//>?
// app.use(function (req, res, next) {
//   res.locals.session = req.session;
//   next();
// });

//no favicon loaded
app.get("/favicon.ico", (req, res) => res.status(204));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/gallery", galleryRouter);
app.use("/play", playRouter);
app.use("/game", gameRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
