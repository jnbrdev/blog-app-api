const Post = require("../models/Post");
const User = require('../models/User'); // Adjust path as necessary

// Get all posts
module.exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error });
    }
};

module.exports.getMyPosts = async (req, res) => {
    try {
        const userId = req.user.id; // Get userId from the logged-in user
        const posts = await Post.find({ userId: userId }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error });
    }
};


module.exports.getPost = async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId).lean(); // Use .lean() for performance
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Extract userIds from comments
        const userIds = post.comments.map(comment => comment.userId);

        // Fetch users with their emails
        const users = await User.find({ _id: { $in: userIds } }, '_id email');

        // Create a lookup map for userId to email
        const userEmailMap = Object.fromEntries(users.map(user => [user._id.toString(), user.email]));

        // Add email to each comment
        post.comments = post.comments.map(comment => ({
            ...comment,
            email: userEmailMap[comment.userId.toString()] || null, // Null if email not found
        }));

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Error fetching post", error });
    }
};


// Add a new post
module.exports.addPost = async (req, res) => {
    const { author, title, content, img } = req.body;
    const userId = req.user.id; // Get userId from the logged-in user

    try {
        // Find the email of the user by their ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add the email to the author object
        author.email = user.email;

        // Create a new post with the author email included
        const newPost = new Post({ userId, author, title, content, img });
        const savedPost = await newPost.save();
        
        // Respond with the saved post
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: "Error creating post", error });
    }
};

// Update an existing post
module.exports.updatePost = async (req, res) => {
    const { title, content, img, author } = req.body;
    const { postId } = req.params;
    const userId = req.user.id; // Get userId from the logged-in user
    try {
        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, userId }, // Ensure the post belongs to the logged-in user
            { title, content, img, author },
            { new: true, runValidators: true }
        );
        if (!updatedPost) return res.status(404).json({ message: "Post not found or unauthorized" });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: "Error updating post", error });
    }
};

// Delete a post
module.exports.deletePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id; // Get userId from the logged-in user
    try {
        const deletedPost = await Post.findOneAndDelete({ _id: postId, userId }); // Ensure the post belongs to the logged-in user
        if (!deletedPost) return res.status(404).json({ message: "Post not found or unauthorized" });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error });
    }
};

module.exports.deletePostAdmin = async (req, res) => {
    const { postId } = req.params;
    try {
        const deletedPost = await Post.findOneAndDelete({ _id: postId }); // Ensure the post belongs to the logged-in user
        if (!deletedPost) return res.status(404).json({ message: "Post not found or unauthorized" });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error });
    }
};

// Add a comment to a post
module.exports.addComment = async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id; // Get userId from the logged-in user
    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        post.comments.push({ userId, comment });
        await post.save();
        res.status(200).json({ message: "Comment added successfully", post });
    } catch (error) {
        res.status(400).json({ message: "Error adding comment", error });
    }
};

// Get comments of a specific post
module.exports.getComments = async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(post.comments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error });
    }
};

module.exports.deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user.id; // Get userId from the logged-in user
    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Find the comment in the comments array
        const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId && comment.userId === userId);
        if (commentIndex === -1) {
            return res.status(404).json({ message: "Comment not found or unauthorized" });
        }

        // Remove the comment from the comments array
        post.comments.splice(commentIndex, 1);
        await post.save();
        
        res.status(200).json({ message: "Comment deleted successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment", error });
    }
};


