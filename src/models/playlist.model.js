import mongoose from 'mongoose';
import {Schema} from 'mongoose';

const playlistSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'Video'
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
export const Playlist = mongoose.model('Playlist', playlistSchema);