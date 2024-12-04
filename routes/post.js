const express = require("express");
const postController = require("../controllers/post");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.get("/getPosts", postController.getAllPosts);
router.get("/getMyPosts", verify,postController.getMyPosts);
router.get("/getPost/:postId", postController.getPost);
router.post("/addPost", verify, postController.addPost);
router.patch("/updatePost/:postId", verify, postController.updatePost);
router.delete("/deletePostAdmin/:postId", verify, verifyAdmin, postController.deletePostAdmin);
router.delete("/deletePost/:postId", verify, postController.deletePost);
router.patch("/addComment/:postId", verify, postController.addComment);
router.get("/getComments/:postId", postController.getComments);
router.delete("/deleteComment/:postId/:commentId", verify, postController.deleteComment);

module.exports = router;