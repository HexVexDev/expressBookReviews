const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username,password} = req.body

  if(!username || !password){
    return res.status(402).json({message:"Username or password empty"})
  }
  if(isValid(username)){
    let userToRegister = { username:username, password:password}
    users.push(userToRegister)
    return res.status(200).json({message:"User succesfully registered"})
  }
  return res.status(403).json({message:"user already exists"})
});

// Function to get the book list
const getBookList = () => {
    return new Promise((resolve, reject) => {
      if (books) {
        let bookList = books; 
        if (Object.keys(bookList).length > 0) {
          resolve({
            message: "Here's a list of the books found:",
            books: bookList
          });
        } else {
          reject({
            status: 404,
            message: "There are no books to show",
            books: []
          });
        }
      } else {
        reject({
          status: 500,
          message: "Internal Server Error"
        });
      }
    });
  };
  
 
  public_users.get('/', function (req, res) {
    getBookList()
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return res.status(error.status || 500).json(error);
      });
  });

// Get book details based on ISBN
const fetchBookDetailsByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ message: "Book not found" });
      }
    });
  };
  
  public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    fetchBookDetailsByISBN(isbn)
      .then(bookDetails => {
        return res.status(200).json({ book: bookDetails });
      })
      .catch(error => {
        return res.status(404).json(error);
      });
  });
  
// Function to fetch books by author
const fetchBooksByAuthor = (authorName) => {
    return new Promise((resolve, reject) => {
      let foundBooks = [];
      let booksKeys = Object.keys(books);
  
      booksKeys.forEach(bk => {
        if (books[bk].author.toLowerCase() === authorName) {
          foundBooks.push(books[bk]);
        }
      });
  
      if (foundBooks.length > 0) {
        resolve(foundBooks);
      } else {
        reject({ message: "Book not found" });
      }
    });
  };
  
  
  public_users.get('/author/:author', (req, res) => {
    const authorName = req.params.author.toLowerCase();
  
    fetchBooksByAuthor(authorName)
      .then(foundBooks => {
        return res.status(200).json({ message: "Found books", books: foundBooks });
      })
      .catch(error => {
        return res.status(404).json(error);
      });
  });

// Get all books based on title
const fetchBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      let foundBooks = [];
      let booksKeys = Object.keys(books);
  
      booksKeys.forEach(bk => {
        if (books[bk].title.toLowerCase() === title) {
          foundBooks.push(books[bk]);
        }
      });
  
      if (foundBooks.length > 0) {
        resolve(foundBooks);
      } else {
        reject({ message: "Book not found" });
      }
    });
  };
  
  public_users.get('/title/:title', (req, res) => {
    const bookTitle = req.params.title.toLowerCase();
  
    fetchBooksByTitle(bookTitle)
      .then(foundBooks => {
        return res.status(200).json({ message: "Found books", books: foundBooks });
      })
      .catch(error => {
        return res.status(404).json(error);
      });
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn
  if(books[isbn]){
    let reviewsForBook = books[isbn].reviews
    if(reviewsForBook){
    return res.status(200).json({reviews:reviewsForBook})
    }
    return res.status(300).json({message:"There are no reviews for this book"})
  }
  return res.status(404).json({message: "Not found"});
});


module.exports.general = public_users;
