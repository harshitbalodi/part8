const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const author = mongoose.Schema({
  name: {
    type: String,
    minlength: 4,
    required: true,
    unique: true,
  },
  bookCount: {
    type: Number,
    default: 0,
  },
  born:{
    type:Number,
  }
});

author.plugin(uniqueValidator);

const Author = mongoose.model("Author", author);
module.exports = Author;
