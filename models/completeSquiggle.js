const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const squiggleSchema = new Schema({
  author: { type: String, default: "anon" },
  time: { type: Date, default: Date.now },
  img: { data: String },
  img2: { data: String },
  reports: { type: Number, default: 0 },
  gameId: { type: String, default: null },
});

module.exports = mongoose.model("completedSquiggle", squiggleSchema);
