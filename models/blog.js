const mongoose = require("mongoose");

var BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  text: {
    type: String,
    required: true,
    minlength: 1
  },
  image: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  },
  edited: {
    type: Boolean,
    default: false
  }
  //   _creator: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     required: true
  //   }
});

module.exports = mongoose.model("Blog", BlogSchema);
