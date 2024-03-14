const { v1: uuidV1 } = require("uuid");
const Book = require("../model/book");
const Author = require("../model/author");

const typeDefs = `
    
    type Author{
        name:String
        born:Int
        bookCount:Int
    }
    type Book{
        title:String!
        published:Int!
        author:Author!
        genres:[String!]
    }
    type Query {
    bookCount: Int!
    authorCount:Int!
    allBooks(author:String, genre:String):[Book!]!
    allAuthors:[Author!]!
  }

  type Mutation{
    addBook(title:String!,author:String!, published:Int!, genres:[String!]!):Book!
    editAuthor(name:String!, setBornTo:Int!):Author
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.find({}).length,
    authorCount: async () => Author.find({}).length,
    allBooks: async (root, args) => {
      try {
        const books = await Book.find({}).populate("author");
        console.log("books inside the allBooks",books)
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
  },
  Mutation: {
    addBook: async (root, args) => {
      try {
        const authors = await Author.find({});
        console.log("authors",authors);
        const exist = authors.find((author) => author.name === args.author);
        console.log("exist",exist);
        if (!exist){
          const author = new Author({ name: args.author });
          await author.save();
        }
        const author = await Author.find({ name: args.author });
        console.log("author",author);
        const book = new Book({ ...args, author: author[0]?._id });
        await book.save();
        const newBook = await Book.find({ title: book.title }).populate("author");
        console.log("newBook",newBook);
        return newBook[0];
      } catch (error) {
        console.log("error",error);
      }
    },
    editAuthor: async (root, args) => {
      const authors = await Author.find({});
      const author = authors.some((author) => author.name === args.name);
      if (!author) return null;
      await Author.findByIdAndUpdate(author._id,{...author,born:args.born});
      return Author.find({ name: author.name });
    },
  },
};

module.exports = { resolvers, typeDefs };
