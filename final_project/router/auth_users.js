const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password are provided in the request body
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
  }

  // Find the user by username
  const user = users.find(user => user.username === username);

  // If the user does not exist or the password doesn't match
  if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
  }

  // If login is successful, create a JWT and store it in the session
  const token = jwt.sign({ username: user.username }, 'your_jwt_secret');

  // Store the token in the session
  req.session.authorization = {
      accessToken: token
  };

  // Send the token as a response (just in case the front-end needs it)
  return res.status(200).json({ message: "Login successful", token: token });
});




// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];  // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');

    const username = decoded.username;  // Retrieve the username from the decoded token

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
  const token = req.headers['authorization']?.split(' ')[1];  // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');  // Ensure the secret is the same
    const username = decoded.username;  // Get the username from the decoded token

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
