'use strict';
const express = require("express");
const router  = express.Router();
const Post = require("../../models/posts");
//const middleware = require("../middleware");

const cloudinary = require('cloudinary');
const multer = require('multer');
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* GET ALL POSTS */
router.get('/', async (req, res, next) => {
  try {
    // Get all posts from DB and return res.send('Nothing to show :(')
    await Post.find({}, (err, posts) => {
      res.json(posts);
    })
    .sort({ created_date: -1 });
  } catch (err) {
    next(err)
  }
});

/* SAVE A POST */
router.post('/', async (req, res, next) => {
  try {
    // get data from form and save to DB
    await Post.create(req.body.post, (err, post) => {
      //post.save();
      res.send({
        message: 'Added document to DB'
      })
    });
  } catch(err) {
    next(err)
  }
});

/* SHOW A POST */
router.get('/:id', async (req, res, next) => {
  try {
    //find the post with provided ID
    await Post.findById(req.params.id, (err, post) => {
      //render show template with that post
      res.json({post});
    });
  } catch(err) {
    next(err)
  }
});

/* UPDATE A POST */
// post.update({ _id: id }, { $set: { size: 'large' }}, callback);
router.put('/:id', async (req, res, next) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, req.body.post, (err, post) => {
      console.log('Updated document with ID: ' + id)
      res.json({id})
    });
  } catch(err) {
    next(err)
  }
});

// DELETE - removes post from the database
router.delete("/:id",async (req, res, next) => {
  try {
    await Post.findByIdAndRemove({ _id: req.params.id }, (err, post) => {
      console.log('Deleted document with ID: ' + _id)
      res.json({id})
    })
  } catch(err) {
    next(err)
  }
});

module.exports = router;