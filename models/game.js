const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  name: { type: String },
  players: { type: Array, default: [] },
  turn: { type: Number, default: 0 },
  turnName: { type: String },
  admin: { type: String },
  completedSquiggles: { type: Array, default: [] }, //not needed?  - gameId is saved on squiggle
  squiggles: { type: Array, default: [] }, //not needed?
});

module.exports = mongoose.model("game", gameSchema);
