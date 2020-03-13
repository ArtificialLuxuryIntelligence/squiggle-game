const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const squiggleSchema = new Schema({
  author: { type: String, default: "anon" },
  time: { type: Date, default: Date.now },
  img: { data: String },
  img2: { data: String },
  reports: { type: Number, default: 0 }
});

module.exports = mongoose.model("completedSquiggle", squiggleSchema);
