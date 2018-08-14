const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Schema definition
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    minlength: [6, "Username needs to have the minimum length of 6."],
    unique: true,
    trim: true,
    validate: {
      validator: function(value) {
        return /[0-9a-zA-Z_]+/.test(value);
      },
      message: "{VALUE} is not a valid username."
    }
  },
  email: {
    type: String,
    required: [true, "email is required"],
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email."
    }
  },
  password: {
    type: String,
    require: [true, "Password is required"],
    minlength: [6, "Password needs to meet the minimum length of 6"]
  },
  tokens: [{ token: { type: String, required: true } }]
});

// Schema functions
// Instance functions
UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var token = jwt.sign({ _id: user._id.toHexString() }, "TopSecret", {
    expiresIn: "0.01h"
  });

  user.tokens.push({ token });
  return user.save().then(() => {
    // This will grab the token return from then and return to where the function is called
    return token; // This return will not return token to the function is called
    // It only returns the token for the next chained then.
  });
};

UserSchema.methods.removeToken = function(token) {
  var user = this;

  user.update({ $pull: { tokens: { token } } }).then();
};

// Model functions
UserSchema.statics.verifyCredential = function(uOre, password) {
  var User = this;
  var findByEmail = false;

  if (validator.isEmail(uOre)) {
    findByEmail = true;
  }

  return User.findOne(findByEmail ? { email: uOre } : { username: uOre }).then(
    foundUser => {
      if (!foundUser) {
        return Promise.reject("This user doesn't exist.");
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, foundUser.password, (err, result) => {
          if (result) {
            resolve(foundUser);
          } else {
            reject("Wrong password.");
          }
        });
      });
    }
  );
};

// Schema middlewares
UserSchema.pre("save", function(next) {
  var user = this;

  if (user.isModified("password")) {
    bcrypt
      .genSalt(10)
      .then(salt => {
        bcrypt.hash(user.password, salt, (err, hashedPassword) => {
          if (err) {
            console.log(err);
            return Promise.reject();
          }

          user.password = hashedPassword;
          next();
        });
      })
      .catch(err => {
        console.log(err);
        return Promise.reject();
      });
  } else {
    next();
  }
});

module.exports = mongoose.model("User", UserSchema);
