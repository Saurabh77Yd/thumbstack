import Joi from "joi";
import { READING_STATUS_VALUES } from "../constants/readingStatus.enum.js";

export const createBookSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300).required(),
  author: Joi.string().trim().min(1).max(200).required(),
  tags: Joi.array().items(Joi.string().trim().min(1)).default([]),
  status: Joi.string().valid(...READING_STATUS_VALUES),
});

export const updateBookSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300),
  author: Joi.string().trim().min(1).max(200),
  tags: Joi.array().items(Joi.string().trim().min(1)),
  status: Joi.string().valid(...READING_STATUS_VALUES),
}).min(1);

export const bookQuerySchema = Joi.object({
  status: Joi.string().valid(...READING_STATUS_VALUES),
  tag: Joi.string().trim(),
});
