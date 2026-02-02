import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  bolim: String,
  name: String,
  date: Date,
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
