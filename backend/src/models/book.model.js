import mongoose from "mongoose";
import { READING_STATUS_VALUES, READING_STATUS } from "../constants/readingStatus.enum.js";

const bookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: READING_STATUS_VALUES,
      default: READING_STATUS.WANT_TO_READ,
    },
  },
  { timestamps: true }
);

bookSchema.index({ userId: 1, status: 1 });
bookSchema.index({ userId: 1, tags: 1 });

export default mongoose.model("Book", bookSchema);
