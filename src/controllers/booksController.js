import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js"

export const createBook = async (req, res) => {
    try {

        const { title, caption, rating, image } = req.body;

        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "All fields are required" });
        };

        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageURL = uploadResponse.secure_url

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageURL,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json(newBook);

    } catch (error) {
        console.log("Error in creating book route ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getBook = async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = r(page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 }) //desc
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage")

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });

    } catch (error) {
        console.log("Error in get book route ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// get recommended books by the logged in user
export const bookRecommend = async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json(books);
    } catch (error) {
        console.log("Error in book recommend route ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteBook = async (req, res) => {
    try {

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        if (book.user.toString() !== req.user._id.tostring()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // delete the image from cloudinary
        if (book.image && book.image.includes("cloudinary")) {

            try {

                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);

            } catch (deleteError) {
                console.log("Error in deleting image in cloudinary ", deleteError);
            }
        }

        await book.deleteOne();

        res.joson({ message: "Book deleted successfully" })

    } catch (error) {
        console.log("Error in delete book route ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};