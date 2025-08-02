import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  mediaUrl: [
    {
      url: {
        type: String,
        required: true,
        match: [
          /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|mp4|mov|mkv))$/,
          "Please provide a valid media URL",
        ],
      },
      type: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
    },
  ],
  likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: 300,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  visibility: {
    type: String,
    enum: ["public", "private", "friends"],
    default: "public",
  },
  tags: [String], // hashtags or categories
  location: {
    type: String,
  },
},{
    timestamps : true
});

postSchema.index({ content: 'text', tags : 'text'})
postSchema.index({userId : 1})

const Post = mongoose.model('Post', postSchema);

export default Post;