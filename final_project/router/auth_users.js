const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {username:"pedrito123", password:"root123"}
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let usernamePresent = (element) => element === username;
if(users.some(usernamePresent)){
    return false
}
return true
}

const authenticateUser = (username,password)=>{ //returns boolean
    let foundUser = users.find(usr => usr.username === username)
    if(foundUser && foundUser.password === password){
        return true
    }
    return false
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username,password} = req.body
    if(authenticateUser(username,password)){
        let accessToken = jwt.sign({
            data: password
          }, 'fingerprint_customer', { expiresIn: 60 * 60 });
          req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    }
    return res.status(208).json({message:"Invalid info. Verify username or password"})
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization["username"];
    const review = req.body;
  
    if (books[isbn]) {
      let reviewsForBook = books[isbn].reviews;
      let reviewsKeys = Object.keys(reviewsForBook);
  
      if (reviewsKeys.length > 0) {
        for (let rvKey of reviewsKeys) {
          let reviewToVerify = reviewsForBook[rvKey];
  
          if (reviewToVerify.user === username) {
            // Update existing review
            books[isbn].reviews[rvKey].content = review;
            return res.status(200).json({ message: "Review updated", review: books[isbn].reviews[rvKey] });
          }
        }
      }
  
      let newReviewKey = reviewsKeys.length + 1;
      let newReview = {
        user: username,
        content: review
      };
  
      books[isbn].reviews[newReviewKey] = newReview;
  
      return res.status(200).json({ message: "Review added", review: newReview });
    }
  
    return res.status(404).json({ message: "Book not found" });
  });

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization["username"];
  
    if (books[isbn]) {
      let reviewsForBook = books[isbn].reviews;
      let reviewsKeys = Object.keys(reviewsForBook);
  
      if (reviewsKeys.length > 0) {
        for (let rvKey of reviewsKeys) {
          let reviewToVerify = reviewsForBook[rvKey];
  
          if (reviewToVerify.user === username) {
            // Remove existing review
            delete books[isbn].reviews[rvKey];
            return res.status(200).json({ message: "Review removed", review: reviewToVerify });
          }
        }
      }
  
      return res.status(404).json({ message: "Review not found for the specified user" });
    }
  
return res.status(404).json({ message: "Book not found" });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
