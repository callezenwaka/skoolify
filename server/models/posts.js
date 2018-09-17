'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required:true
  },
  description: {
    type: String,
    required:true
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    email: String
  },
  image: String,
  imageId: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: [{
      type: String,
      enum: ['pending', 'approved','archieved']
    }],
    default: ['pending']
  }
});

module.exports = mongoose.model('Post', PostSchema);