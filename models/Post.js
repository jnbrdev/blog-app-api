const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        trim: true,
    },
    author: {
        name: {
            type: String,
            required: [true, 'Author name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Author email is required'],
            trim: true,
        },
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true,
    },
    img: {
        type: String,
        required: false,
        trim: true,
    },
    comments: [
        {
            userId: {
                type: String,
                required: [true, 'User ID is required'],
            },
            comment: {
                type: String,
                required: [true, 'Comment is required'],
                trim: true,
            },
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Post", postSchema);
