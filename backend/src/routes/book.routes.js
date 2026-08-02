import express from "express";
import * as bookController from "../controllers/book.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createBookSchema,
  updateBookSchema,
  bookQuerySchema,
} from "../validators/book.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", validate(bookQuerySchema, "query"), bookController.getBooks);
router.post("/", validate(createBookSchema), bookController.createBook);
router.put("/:id", validate(updateBookSchema), bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

export default router;
