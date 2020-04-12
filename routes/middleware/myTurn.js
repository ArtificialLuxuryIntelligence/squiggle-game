const Game = require("../../models/game");

module.exports = async (req, res, next) => {
  if (req.user) {
    let waitingGames = await Game.find({ turnName: req.user.name });
    if (waitingGames.length == 0) {
      console.log("NO WAITING GAMES");
      req.session.waitingGames = null;
    } else {
      req.session.waitingGames = waitingGames;
      console.log("WAITING GAMES:", waitingGames);
    }
    next();
    return;
  }
  next();
};
