import Book from "../models/book.model.js";
import ApiError from "../utils/apiError.util.js";
import httpStatus from "../constants/httpStatusCodes.js";
import { BOOK } from "../constants/messages.js";

export const getBooks = async (userId, { status, tag }) => {
  const query = { userId };
  if (status) query.status = status;
  if(tag){
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); 
    query.tags = { $elemMatch: { $regex: escapedTag, $options: "i" } }
  };

  return Book.find(query).sort({ createdAt: -1 });
};

export const getBookByIdForUser = async (bookId, userId) => {
  const book = await Book.findById(bookId);

  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, "BOOK_NOT_FOUND", BOOK.NOT_FOUND);
  }

  if (book.userId.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "FORBIDDEN", BOOK.FORBIDDEN);
  }

  return book;
};

export const createBook = async (userId, bookData) => {
  return Book.create({ ...bookData, userId });
};

export const updateBook = async (bookId, userId, updates) => {
  const book = await getBookByIdForUser(bookId, userId);

  Object.assign(book, updates);
  await book.save();

  return book;
};

export const deleteBook = async (bookId, userId) => {
  const book = await getBookByIdForUser(bookId, userId);
  await book.deleteOne();
};
