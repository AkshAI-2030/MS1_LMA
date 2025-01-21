const {
  User: userModel,
  Book: bookModel,
  ReadingList: readingListModel,
} = require("../models");

const {
  validateUsernameEmail,
  validateBookDetails,
  validateSearchBook,
  validateReadingList,
} = require("../validations/index");

//1.
const addUser = async (req, res) => {
  const { username, email } = req.body;
  let errors = validateUsernameEmail(req.body);
  if (errors && errors.length > 0) return res.status(400).json({ errors });
  try {
    let existingEmail = await userModel.findOne({
      where: { email: email },
    });
    if (existingEmail)
      return res.status(409).json({ message: "Email already exists" });
    const response = await userModel.create({ username, email });
    return res
      .status(201)
      .json({ message: "User created successfully.", user: response });
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while creating the user.",
      error: error.message,
    });
  }
};

//2.
const addBook = async (req, res) => {
  const { title, author, genre, publicationYear } = req.body;
  let errors = validateBookDetails(req.body);
  if (errors && errors.length > 0) return res.status(400).json({ errors });
  try {
    const response = await bookModel.create({
      title,
      author,
      genre,
      publicationYear,
    });
    return res
      .status(201)
      .json({ message: "Book added successfully.", book: response });
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while creating the book.",
      error: error.message,
    });
  }
};

//3.
const searchBooks = async (req, res) => {
  const { title, author } = req.query;
  let errors = validateSearchBook(req.query);
  if (errors && errors.length > 0) return res.status(400).json({ errors });
  try {
    const responseFromTitle = await bookModel.findAll({
      where: { title },
      attributes: ["id", "title", "author", "genre", "publicationYear"],
    });
    const responseFromAuthor = await bookModel.findAll({
      where: { author },
      attributes: ["id", "title", "author", "genre", "publicationYear"],
    });
    let totalBooks = new Map();

    if (responseFromTitle && responseFromTitle.length > 0) {
      responseFromTitle.forEach((book) => totalBooks.set(book.id, book));
    }
    if (responseFromAuthor && responseFromAuthor.length > 0) {
      responseFromAuthor.forEach((book) => totalBooks.set(book.id, book));
    }
    if (totalBooks.size === 0) {
      return res.status(400).json({ message: "No books found" });
    }
    return res.status(200).json({ books: Array.from(totalBooks.values()) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured while fetching the books.", error });
  }
};

//4.
const addToReadingList = async (req, res) => {
  const { userId, bookId, status } = req.body;
  let errors = validateReadingList(req.body);
  if (errors && errors.length > 0) return res.status(400).json({ errors });
  if (!["Want to Read", "Reading", "Finished"].includes(status)) {
    return res.status(400).json({
      message:
        'Invalid status. Must be "Want to Read", "Reading", or "Finished".',
    });
  }
  try {
    let existingUser = await userModel.findByPk(userId);
    let existingBook = await bookModel.findByPk(bookId);
    if (!existingUser || !existingBook)
      return res.status(400).json({ message: "Invalid user or book ID" });

    const response = await readingListModel.create({ userId, bookId, status });
    return res
      .status(201)
      .json({ message: "Book added to reading list", readingList: response });
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while creating the readingList.",
      error: error.message,
    });
  }
};

//5.
const updateBook = async (req, res) => {
  const { bookId } = req.params;
  const { title, genre } = req.body;
  if (!title || !genre)
    return res.status(400).json({ message: "Title and genre is required" });
  try {
    const existingBook = await bookModel.findByPk(bookId);
    if (!existingBook)
      return res.status(400).json({ message: "Book not found" });
    existingBook.title = title;
    existingBook.genre = genre;
    let updatedBook = await existingBook.save();
    return res.status(201).json({
      message: "Book details updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while creating the book.",
      error: error.message,
    });
  }
};

//6.
const getUserByReadingList = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "UserId is required" });
  try {
    const user = await userModel.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or no books in reading list" });
    }

    const readingList = await readingListModel.findAll({
      where: { userId },
      attributes: ["id", "userId", "status"],
      include: [
        {
          model: bookModel,
          attributes: ["title", "author", "genre"],
        },
      ],
    });

    if (!readingList || readingList.length === 0)
      return res
        .status(400)
        .json({ message: "User not found or no books in reading list" });

    const response = readingList.map((entry) => {
      return {
        id: entry.id,
        userId: entry.userId,
        status: entry.status,
        books: {
          title: entry.Book.title,
          author: entry.Book.author,
          genre: entry.Book.genre,
        },
      };
    });
    return res.status(200).json({ readingList: response });
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while fetching the User readinglist",
      error: error.message,
    });
  }
};

//7.
const removeBookFromReadingList = async (req, res) => {
  const { readingListId } = req.body;
  if (!readingListId)
    return res
      .status(400)
      .json({ message: "Required readingListId to delete" });
  try {
    const existingReadingList = await readingListModel.findByPk(readingListId);
    if (!existingReadingList)
      return res.status(404).json({ message: "Reading list entry not found" });
    await existingReadingList.destroy();
    return res.status(200).json({ message: "Book removed from reading list" });
  } catch (error) {}
};

module.exports = {
  addUser,
  addBook,
  searchBooks,
  addToReadingList,
  updateBook,
  getUserByReadingList,
  removeBookFromReadingList,
};
