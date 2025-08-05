import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    mediaId: [
      {
        _id: false,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "media",
        },
        mediatype: {
            type: String,
            enum: ["profile", "private", "public"],
            default: "public",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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
    tags: [String], // hashtags or categories
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ content: 'text', tags : 'text'})
postSchema.index({userId : 1})

const Post = mongoose.model('Post', postSchema);

export default Post;