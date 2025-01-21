const {
  addUser,
  addBook,
  searchBooks,
  addToReadingList,
  updateBook,
  getUserByReadingList,
  removeBookFromReadingList,
} = require("../controllers/dataController");
const { User, Book, ReadingList } = require("../models");

jest.mock("../models");

describe("Controller Unit Tests", () => {
  afterEach(() => jest.clearAllMocks());

  // 1. Test for addUser
  test("should add a user successfully", async () => {
    const mockUser = { id: 1, username: "testUser", email: "test@example.com" };
    jest.spyOn(User, "create").mockResolvedValue(mockUser);

    const req = { body: { username: "testUser", email: "test@example.com" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully.",
      user: mockUser,
    });
  });

  test("should return error when email already exists", async () => {
    jest
      .spyOn(User, "findOne")
      .mockResolvedValue({ email: "test@example.com" });

    const req = { body: { username: "testUser", email: "test@example.com" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email already exists",
    });
  });

  // 2. Test for addBook
  test("should add a book successfully", async () => {
    const mockBook = {
      id: 1,
      title: "Book Title",
      author: "Author Name",
      genre: "Fiction",
      publicationYear: 2021,
    };
    jest.spyOn(Book, "create").mockResolvedValue(mockBook);

    const req = {
      body: {
        title: "Book Title",
        author: "Author Name",
        genre: "Fiction",
        publicationYear: 2021,
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addBook(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book added successfully.",
      book: mockBook,
    });
  });

  // 3. Test for searchBooks
  test("should return books based on title or author", async () => {
    const mockBooks = [
      { id: 1, title: "Book Title", author: "Author Name" },
      { id: 2, title: "Another Book", author: "Author Name" },
    ];
    jest.spyOn(Book, "findAll").mockResolvedValueOnce([mockBooks[0]]);
    jest.spyOn(Book, "findAll").mockResolvedValueOnce([mockBooks[1]]);

    const req = { query: { title: "Book Title", author: "Author Name" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await searchBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      books: expect.arrayContaining(mockBooks),
    });
  });

  // 4. Test for addToReadingList
  test("should add a book to reading list", async () => {
    const mockUser = { id: 1, username: "testUser" };
    const mockBook = { id: 2, title: "Book Title" };
    const mockReadingList = {
      id: 3,
      userId: 1,
      bookId: 2,
      status: "Reading",
    };

    jest.spyOn(User, "findByPk").mockResolvedValue(mockUser);
    jest.spyOn(Book, "findByPk").mockResolvedValue(mockBook);
    jest.spyOn(ReadingList, "create").mockResolvedValue(mockReadingList);

    const req = {
      body: { userId: 1, bookId: 2, status: "Reading" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addToReadingList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book added to reading list",
      readingList: mockReadingList,
    });
  });

  // 5. Test for updateBook
  test("should update book details", async () => {
    const mockBook = {
      id: 1,
      title: "Old Title",
      genre: "Old Genre",
      save: jest.fn().mockResolvedValue({
        id: 1,
        title: "New Title",
        genre: "New Genre",
      }),
    };

    jest.spyOn(Book, "findByPk").mockResolvedValue(mockBook);

    const req = {
      params: { bookId: "1" },
      body: { title: "New Title", genre: "New Genre" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateBook(req, res);

    expect(Book.findByPk).toHaveBeenCalledWith("1");
    expect(mockBook.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book details updated successfully",
      book: {
        id: 1,
        title: "New Title",
        genre: "New Genre",
      },
    });
  });

  // 6. Test for getUserByReadingList
  test("should return user reading list", async () => {
    const mockReadingList = [
      {
        id: 1,
        userId: 1,
        status: "Reading",
        Book: {
          title: "Book Title",
          author: "Author Name",
          genre: "Fiction",
        },
      },
    ];
    jest.spyOn(ReadingList, "findAll").mockResolvedValue(mockReadingList);

    const req = { params: { userId: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUserByReadingList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      readingList: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          userId: 1,
          status: "Reading",
          books: {
            title: "Book Title",
            author: "Author Name",
            genre: "Fiction",
          },
        }),
      ]),
    });
  });

  // 7. Test for removeBookFromReadingList
  test("should remove a book from the reading list", async () => {
    const mockReadingList = { id: 1 };
    jest.spyOn(ReadingList, "findByPk").mockResolvedValue(mockReadingList);
    mockReadingList.destroy = jest.fn().mockResolvedValue();

    const req = { body: { readingListId: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await removeBookFromReadingList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book removed from reading list",
    });
  });

  test("should return error when required fields are missing", async () => {
    const req = {
      body: { title: "Test Book", author: "", publicationYear: 1930 },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addBook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        "Book author is required and should be string",
        "Book genre is required and should be string.",
      ],
    }); 
  });
  test("should return error when user does not exist", async () => {
    const req = { body: { userId: 999, bookId: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jest.spyOn(User, "findByPk").mockResolvedValue(null);

    await addToReadingList(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ["status is required and should be string."],
    });
  });
});
