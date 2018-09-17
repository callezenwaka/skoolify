'use strict';
const express = require("express");
const router  = express.Router();
const Post = require("../models/posts");
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
  cloud_name: 'callezenwaka', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX - show all post profiles
router.get('/', (req, res) => {
  // Get all posts from DB and return res.send('Nothing to show :(')
  Post.find({}, function(err, posts){
    if(err){
      console.log(err);
    } else {//res.send('here')
      res.render('post/index', {posts: posts, page: 'posts'});
    }
  })
  .sort({ created_date: -1 });
});

//NEW - show form to create for new post
router.get('/publish', (req, res) => {
  res.render('post/create',  {page: 'publish'});
});

//CREATE - add new post to DB
router.post('/', upload.single('image'), function(req, res){
  cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
    if(err) {
      //req.flash('error', err.message);
      return res.redirect('back');
    }
    // add cloudinary url for the image to the post object under image property
    req.body.post.image = result.secure_url;
    // add image's public_id to post object
    req.body.post.imageId = result.public_id;
    // get data from form and save to DB
    Post.create(req.body.post, function(err, post){
      if(err){
          console.log(err);
      } else {
        //post.save()
        res.redirect('/posts');
      }
    });
  });
});

// SHOW - shows more info about one post
router.get('/:id', function(req, res){
  //find the post with provided ID
  Post.findById(req.params.id,function(err, post){
      if(err || !post){
          console.log(err);
          //req.flash('error', 'Sorry, this post does not exist!');
          return res.redirect('/posts');
      }
      //render show template with that post
      res.render('post/show', {post: post});
  });
});

// EDIT - shows edit form for a post
router.get('/:id/edit', function(req, res){
  //console.log(req.post)
  //render edit template with that post
  Post.findById(req.params.id,(err, post) => {
      if(err || !post){
          console.log(err);
          //req.flash('error', 'Sorry, this post does not exist!');
          return res.redirect('/posts');
      }
      //render show template with that post
      res.render('post/edit', {post: post});
  });
});

// PUT - updates post in the database
// post.update({ _id: id }, { $set: { size: 'large' }}, callback);
router.put('/:id', upload.single('image'), (req, res) => {
  Post.findById(req.params.id, async (err, post) => {
    if(err){
        //req.flash("error", err.message);
        console.log(err);
        res.redirect("back");
    } else {
      if (req.file) {
        try {
            await cloudinary.v2.uploader.destroy(post.imageId);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            post.imageId = result.public_id;
            post.image = result.secure_url;
        } catch(err) {
            console.log(err)
            // req.flash("error", err.message);
            return res.redirect("back");
        }
      }
      post.title = req.body.title;
      post.description = req.body.description;
      console.log(post)
      post.save();
      //req.flash("success","Successfully Updated!");
      res.redirect('/posts');
    }
  });
});

// DELETE - removes post from the database
router.delete("/:id",function(req, res) {
  Post.findById(req.params.id, async (err, post) => {
    try {
      await cloudinary.v2.uploader.destroy(post.imageId);
      await post.remove();
      // req.flash('success', 'Campground deleted successfully!');
      res.redirect('/posts');
    } catch(err) {
      console.log(err)
    }
    //req.flash('error', 'post deleted!');
    res.redirect('/posts');
  })
});

module.exports = router;