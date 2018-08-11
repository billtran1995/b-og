const mongoose = require("mongoose");
const validator = require("validator");

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 6,
    unique: true,
    trim: true,
    validate: {
      validator: validator.isAlphanumeric,
      message:
        "{VALUE} is not a valid username.\n" +
        " Make sure it is an alphanumeric."
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    mindlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{value} is not a valid email."
    }
  },
  password: {
    type: String,
    require: true,
    mindlength: 6
  }
});

module.exports = mongoose.model("User", UserSchema);
