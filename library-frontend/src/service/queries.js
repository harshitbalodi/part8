import { gql } from "@apollo/client"
export const ALL_AUTHORS = gql`
query{
  allAuthors {
    born
    name
    bookCount
  }
}
`
export const ALL_BOOKS = gql`
query {
  allBooks {
    author
    genres
    published
    title
  }
}
`
export const ADD_BOOK = gql`
mutation($title: String!, 
  $author: String!, 
  $published: Int!, 
  $genres: [String!]!) {
  addBook(title: $title,
     author: $author,
      published: $published, 
      genres: $genres) {
    title,
    author
    genres
    published
  }
}`

export const EDIT_AUTHOR = gql`
mutation($name:String!, $setBornTo:Int!){
    editAuthor(name:$name, setBornTo:$setBornTo){
        born
        name
    }
}
`