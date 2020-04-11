const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const squiggleSchema = new Schema({
  author: { type: String, default: "anon" },
  time: { type: Date, default: Date.now },
  //array-->??? line is an array..

  line: { type: String, required: true },
  size: { type: String },
  reports: { type: Number, default: 0 },
});

module.exports = mongoose.model("squiggle", squiggleSchema);
