const mongoose = require("mongoose");

const connectionURL = env(DATABASE_URL);

mongoose.connect(connectionURL);

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
  gender: String,
  interests: [String],
  bio: String,
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = { UserModel };
