const express = require("express");
const app = express();
const cors = require("cors");
const { sequelize } = require("./models");
require("dotenv").config();

const {
  addUser,
  addBook,
  searchBooks,
  addToReadingList,
  updateBook,
  getUserByReadingList,
  removeBookFromReadingList,
} = require("./controllers/dataController");

app.use(express.json());
app.use(cors());

app.post("/api/users", addUser);
app.post("/api/books", addBook);
app.get("/api/books/search", searchBooks);
app.post("/api/reading-list", addToReadingList);
app.post("/api/books/:bookId", updateBook);
app.get("/api/reading-list/:userId", getUserByReadingList);
app.post("/api/reading-list/delete", removeBookFromReadingList);

sequelize
  .authenticate()
  .then(() => {
    console.log("Data base connnected");
  })
  .catch((error) => {
    console.log("Error unable to connec to database.", error);
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

module.exports = { app };
