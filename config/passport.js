var LocalStrategy = require("passport-local").Strategy;
var passport = require("passport");
const bcrypt = require("bcrypt");
var User = require("../models/user");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "name",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, name, password, done) {
      process.nextTick(function () {
        User.findOne({ name: name }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, false, { message: "Name is already taken." });
          }
          var newUser = new User();
          newUser.name = name;
          newUser.password = bcrypt.hashSync(
            password,
            bcrypt.genSaltSync(5),
            null
          );
          newUser.save(function (err, result) {
            if (err) {
              return done(err);
            }
            return done(null, newUser);
          });
        });
      });
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "name",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, name, password, done) {
      User.findOne({ name: name }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "No user found." });
        }

        if (bcrypt.compareSync(password, user.password)) {

          return done(null, user);
        }
        return done(null, false, { message: "Wrong password." });
      });
    }
  )
);
