import * as bookService from "../services/book.service.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { sendSuccess } from "../utils/apiResponse.util.js";
import httpStatus from "../constants/httpStatusCodes.js";
import { BOOK } from "../constants/messages.js";

export const getBooks = asyncHandler(async (req, res) => {
  const books = await bookService.getBooks(req.user.id, req.query);
  sendSuccess(res, httpStatus.OK, books, BOOK.FETCHED);
});

export const createBook = asyncHandler(async (req, res) => {
  const book = await bookService.createBook(req.user.id, req.body);
  sendSuccess(res, httpStatus.CREATED, book, BOOK.CREATED);
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await bookService.updateBook(req.params.id, req.user.id, req.body);
  sendSuccess(res, httpStatus.OK, book, BOOK.UPDATED);
});

export const deleteBook = asyncHandler(async (req, res) => {
  await bookService.deleteBook(req.params.id, req.user.id);
  sendSuccess(res, httpStatus.OK, null, BOOK.DELETED);
});
