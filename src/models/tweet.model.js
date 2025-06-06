import mongoose from "mongoose";
import { Schema } from "mongoose";
const TweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    retweetsCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);
export const Tweet = mongoose.model("Tweet", TweetSchema);