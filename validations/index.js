function validateUsernameEmail(data) {
  const { username, email } = data;
  let errors = [];
  if (!username || typeof username !== "string")
    errors.push("Username is required and should be string.");
  if (!email || typeof email !== "string")
    errors.push("Email is required and should be string");
  return errors;
}

function validateBookDetails(data) {
  const { title, author, genre, publicationYear } = data;
  let errors = [];
  if (!title || typeof title !== "string")
    errors.push("Book title is required and should be string.");
  if (!author || typeof author !== "string")
    errors.push("Book author is required and should be string");
  if (!genre || typeof genre !== "string")
    errors.push("Book genre is required and should be string.");
  if (!publicationYear || typeof publicationYear !== "number")
    errors.push("Book publicationYear is required and should be integer");
  return errors;
}

function validateSearchBook(data) {
  const { title, author } = data;
  let errors = [];
  if (
    (!title && !author) ||
    typeof title !== "string" ||
    typeof author !== "string"
  )
    errors.push("Book title or author is required and should be string.");
  return errors;
}

function validateReadingList(data) {
  const { userId, bookId, status } = data;
  let errors = [];
  if (!userId || typeof userId !== "number")
    errors.push("userId is required and should be number.");
  if (!bookId || typeof bookId !== "number")
    errors.push("bookId is required and should be number");
  if (!status || typeof status !== "string")
    errors.push("status is required and should be string.");
  return errors;
}
module.exports = {
  validateUsernameEmail,
  validateBookDetails,
  validateSearchBook,
  validateReadingList,
};
