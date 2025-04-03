const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
  }

  const user = users.find(user => user.username === username);

  if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username: user.username }, 'your_jwt_secret');

  req.session.authorization = {
      accessToken: token
  };

  return res.status(200).json({ message: "Login successful", token: token });
});




// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');

    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for this book" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
