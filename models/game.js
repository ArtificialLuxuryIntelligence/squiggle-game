const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  name: { type: String },
  players: { type: Array, default: [] },
  turn: { type: Number, default: 0 },
  admin: { type: String },
  completedSquiggles: { type: Array, default: [] },
  squiggles: { type: Array, default: [] },
});

module.exports = mongoose.model("game", gameSchema);
