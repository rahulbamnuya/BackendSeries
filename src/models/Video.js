
import mongoose from 'mongoose';
import {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema = new Schema({
 
  videoFile: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
videoSchema.plugin(mongooseAggregatePaginate);
// Add a method to update the view count
export const Video = mongoose.model('Video', videoSchema);
