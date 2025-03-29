import express from 'express';
import { bookRecommend, createBook, deleteBook, getBook } from '../controllers/booksController.js';
import protectRoute from '../middleware/authMiddleware.js';


const router = express.Router();

router.post("/", protectRoute, createBook);
router.get("/", protectRoute, getBook);
router.delete("/:id", protectRoute, deleteBook);
router.get("/user", protectRoute, bookRecommend);

export default router;