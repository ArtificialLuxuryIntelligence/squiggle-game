const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const squiggleSchema = new Schema({
  author: { type: String, default: "anon" },
  time: { type: Date, default: Date.now },
  // line: { type: Array, required: true },
  // img: { data: Buffer, contentType: String }
  img: { data: String }
});

module.exports = mongoose.model("completedSquiggle", squiggleSchema);
