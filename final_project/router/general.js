const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
  }
  
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists." });
  }
  
    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully." })
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/books');
        const books = response.data;

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books." });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(`http://localhost:5000/book/${isbn}`);
        const book = response.data;

        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details." });
    }
});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const response = await axios.get(`http://localhost:5000/books/author/${author}`);
        const booksByAuthor = response.data;

        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
        } else {
            res.status(404).json({ message: "No books found by this author." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author." });
    }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        const response = await axios.get(`http://localhost:5000/books/title/${title}`);
        const booksByTitle = response.data;

        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
        } else {
            res.status(404).json({ message: "No books found with this title." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by title." });
    }
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book." });
    }
});

module.exports.general = public_users;
