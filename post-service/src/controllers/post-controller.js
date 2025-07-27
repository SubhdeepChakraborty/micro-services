import Post from "../models/post.js";
import logger from "../utils/logger.js";
import { validatePost } from "../utils/validate.js";


//Create a new post
const createPost = async (req, res) => {
  logger.info("Hitting creating a new post endpoint");
  try {

    const post = req.body;

    // Validate the post data
    const { error, value } = validatePost(req.body);
    if (error) {
      logger.error("Validation error:", error.details[0].message);
      return res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
    }
    console.log(req)
    // Here you would typically save the post to the database
    const newPost = await Post.create({
      ...value,
      userId: req.user.userId,
    });
    logger.info('Post created successfully...')
    res.status(201).json({
      message: "Post created successfully",
      status: true,
      data: post, // In a real application, you would return the saved post
    });

  } catch (error) {
    logger.error("Error creating post:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

//Get all posts
const getAllpost = async (req, res) => {
  logger.info("Hitting get all posts endpoint....");
  try {
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


//Get a post by Id
const getSinglepost = async (req, res) => {
  logger.info("Hitting single post endpoint ....");
  try {
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


//delete a post by Id
const deleteSinglepost = async (req, res) => {
  logger.info("Hitting delete post endpoint ....");
  try {
  } catch (error) {
    logger.error("Error deleting post:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

export {
    createPost,
    getAllpost,
    getSinglepost,
    deleteSinglepost
}