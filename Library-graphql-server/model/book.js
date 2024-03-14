const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const book = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required:true
  },
  genres: [
    {
      type: String,
    },
  ],
});

book.plugin(uniqueValidator);

const Book = mongoose.model("Book", book);

module.exports = Book;
