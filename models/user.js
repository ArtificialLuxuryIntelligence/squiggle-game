const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  games: { type: Array, default: [] },
});

module.exports = mongoose.model("user", userSchema);
