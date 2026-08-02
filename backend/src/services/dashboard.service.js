import mongoose from "mongoose";
import Book from "../models/book.model.js";
import { READING_STATUS } from "../constants/readingStatus.enum.js";

const RECENT_BOOKS_LIMIT = 5;

export const getDashboardStats = async (userId) => {
  const objectId = new mongoose.Types.ObjectId(userId);

  const [statusCounts, recentBooks] = await Promise.all([
    Book.aggregate([
      { $match: { userId: objectId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Book.find({ userId }).sort({ createdAt: -1 }).limit(RECENT_BOOKS_LIMIT),
  ]);

  const counts = {
    [READING_STATUS.WANT_TO_READ]: 0,
    [READING_STATUS.READING]: 0,
    [READING_STATUS.COMPLETED]: 0,
  };

  let totalBooks = 0;
  statusCounts.forEach(({ _id, count }) => {
    counts[_id] = count;
    totalBooks += count;
  });

  return {
    totalBooks,
    reading: counts[READING_STATUS.READING],
    completed: counts[READING_STATUS.COMPLETED],
    wantToRead: counts[READING_STATUS.WANT_TO_READ],
    recentBooks,
  };
};
