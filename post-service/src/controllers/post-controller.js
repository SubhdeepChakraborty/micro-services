import Post from "../models/post.js";
import logger from "../utils/logger.js";
import { publishEvent } from "../utils/rabbitmq.js";
import { validatePost } from "../utils/validate.js";


//Create a new post
const createPost = async (req, res) => {
  logger.info("Hitting creating a new post endpoint");
  try {
    const username = req.query.username
    const post = req.body;

    if(!username) return res.status(400).send({status : false, message : `Please provide username`})

    // Validate the post data
    const { error, value } = validatePost(req.body);
    if (error) {
      logger.error("Validation error:", error.details[0].message);
      return res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
    }

    // Here you would typically save the post to the database
    const newPost = await Post.create({
      ...value
    });

    if(newPost){
      await req.redisClient.del(`posts:${username}`);
    }

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
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const username = req.query.username

    if (!username)
      return res
        .status(400)
        .send({ status: false, message: `Please provide username` });

    const cachedKey = `posts:${username}`;
    const cachePosts = await req.redisClient.get(cachedKey);

    if (cachePosts) {
      return res.json(JSON.parse(cachePosts))
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    const totalNoPost = posts.length;

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNoPost / limit),
      totalPost: totalNoPost,
    };

    //Save inside cache most important thing
    await req.redisClient.setex(cachedKey, 150, JSON.stringify(result));

    return res.status(200).send(result)
  } catch (error) {
    logger.error("Error fetching post:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


//Get a post by Id
const getSinglepost = async (req, res) => {
  logger.info("Hitting single post endpoint ....");
  try {
    const postId = req.query.postId;
    const singlePost = await Post.find({
      _id : postId
    })
    return res.status(200).send({
      status : true,
      data : singlePost
    })
  } catch (error) {
    logger.error("Error fetching post:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


//delete a post by Id
const deleteSinglepost = async (req, res) => {
  logger.info("Hitting delete post endpoint ....");
  try {
    const postId = req.query.postId;
    const username = req.query.username;

    const post = await Post.findById(postId);

    if (!post) {
      logger.error(`Post not found`);
      return res.status(404).send({
        status: false,
        message: "Post not found",
      });
    }

    let userId = []
    let mediaId = []

    post.mediaId.forEach((e) => {
      userId.push(e.userId.toString())
      mediaId.push(e.media.toString())
    });

    //publish post delete
    await publishEvent("post.delete", {
      postId: post._id.toString(),
      userId: userId,
      media: mediaId,
    });

    await req.redisClient.del(`posts:${username}`);

    await Post.deleteOne({
      _id: post._id,
    });

    return res.status(200).send({
      status: true,
      message: "Post deleted successfully",
    });
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