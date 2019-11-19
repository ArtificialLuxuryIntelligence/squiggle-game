const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const squiggleSchema = new Schema({
  author: { type: String, default: "anon" },
  time: { type: Date, default: Date.now },
  line: { type: String, required: true }
});

module.exports = mongoose.model("squiggle", squiggleSchema);
