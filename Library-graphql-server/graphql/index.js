const Book = require("../model/book");
const Author = require("../model/author");
const { GraphQLError } = require("graphql");
const User = require('../model/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const typeDefs = `
    type User{
        username:String!
        friends:[User!]
        id:ID!
    }
    type Token{
        value:String!
    }

    type Author{
        name:String
        born:Int
        bookCount:Int
    }
    type Book{
        title:String!
        published:Int!
        author:Author
        genres:[String!]
    }

    type Query {
    bookCount: Int!
    authorCount:Int!
    allBooks(author:String, genre:String):[Book!]!
    allAuthors:[Author!]!
    me:User
  }

  type Mutation{
    addBook(
      title:String!
      author:String!
      published:Int!
      genres:[String!]!
    ):Book!
    editAuthor(
      name:String!, 
      setBornTo:Int!
    ):Author
    createUser(
      username:String!
    ):User
    login(
      username:String!,
      password:String!
    ):Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.find({}).length,
    authorCount: async () => Author.find({}).length,
    allBooks: async (root, args) => {
      try {
        const books = await Book.find({}).populate("author");
        console.log("books inside the allBooks", books);
        if (args.author) {
          return books.filter((book) => book.author === args.author);
        }
        if (args.genre) {
          return books.filter((book) =>
            book.genres.some((genre) => genre === args.genre)
          );
        }
        return books;
      } catch (error) {
        console.log(error);
      }
    },
    allAuthors: async () => {
      try {
        const authors = await Author.find({});
        return authors;
        const books = await Book.find({});
        return authors.map((author) => ({
          ...author,
          bookCount: books.filter((book) => book.author === author.name).length,
        }));
      } catch (error) {
        console.log(error);
      }
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      try {
        const authors = await Author.find({});
        console.log("authors", authors);
        const exist = authors.find((author) => author.name === args.author);
        console.log("exist", exist);
        if (!exist) {
          const author = new Author({ name: args.author });
          try {
            await author.save();
          } catch (error) {
            throw new GraphQLError("saving author failed", {
              extensions: {
                code: "BAD_USER_INPUT",
                invalidArgs: args.author,
                error,
              },
            });
          }
        }
        const author = await Author.find({ name: args.author });
        console.log("author", author);
        const book = new Book({ ...args, author: author[0]?._id });
        try {
          await book.save();
        } catch (error) {
          throw new GraphQLError("saving book failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args,
              error,
            },
          });
        }

        const newBook = await Book.find({ title: book.title }).populate(
          "author"
        );
        console.log("newBook", newBook);
        return newBook[0];
      } catch (error) {
        console.log("error", error);
      }
    },
    editAuthor: async (root, args) => {
      const authors = await Author.find({});
      const author = authors.some((author) => author.name === args.name);
      if (!author) return null;
      await Author.findByIdAndUpdate(author._id, {
        ...author,
        born: args.born,
      });
      return Author.find({ name: author.name });
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre
      });
      return user.save().catch(error=>{
        throw new GraphQLError("Creating user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret"){
        return new GraphQLError({
          message: "Wrong username or password",
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
          },
        });
      } 
      const token = jwt.sign({ username: user.username, id: user._id }, process.env.JWT_SECRET);
      return { value: token };
    },
  },
};

module.exports = { resolvers, typeDefs };
