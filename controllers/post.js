const Post = require("../models/Post");

// Get all posts
module.exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error });
    }
};

// Get a specific post by ID
module.exports.getPost = async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
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
        const newPost = new Post({ userId, author, title, content, img });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: "Error creating post", error });
    }
};

// Update an existing post
module.exports.updatePost = async (req, res) => {
    const { title, content, img } = req.body;
    const { postId } = req.params;
    const userId = req.user.id; // Get userId from the logged-in user
    try {
        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, userId }, // Ensure the post belongs to the logged-in user
            { title, content, img },
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


