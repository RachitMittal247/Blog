var express= require("express");
var router=express.Router();
var Blog=require("../models/blog");
var middleware=require("../middleware");

router.get("/blogs", function(req, res) {
  if(req.query.search) {
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
       console.log(regex);
        Blog.find({title: regex}, function(err, blogs){
          if(err){
              console.log(err);
          } else {
             if(blogs.length < 1) {
                req.flash("error","No blog found to your search!!");
                res.redirect("back");
             }else{
             res.render("blogs/index",{blogs:blogs, currentUser: req.user});
           }
          }
       });
   } else {
    Blog.find({}, function(err, blogs) {
        if(err) {
            console.log(err);
        } else {
            res.render("blogs/index", {blogs: blogs, currentUser: req.user});
        }
    });
  }
});

// NEW Route
router.get("/blogs/new",middleware.isLoggedIn,function(req, res) {
   res.render("blogs/new");
});

// CREATE Route
router.post("/blogs",middleware.isLoggedIn, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if(err) {
            console.log(err);
            req.flash("error","Something went wrong");
            res.render("blogs/new");
        } else {
          newBlog.author.id= req.user._id;
          newBlog.author.username=req.user.username;
          newBlog.save();
          console.log(newBlog);
          req.flash("success","Blog created Successfully");
            res.redirect("/blogs");
        }
    });
});

// SHOW Route
router.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id).populate("comments").exec( function(err, foundBlog) {
        if(err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
          console.log(foundBlog.author.username);
          console.log("hi");
            res.render("blogs/show", {blog: foundBlog});
        }
   });
});

// EDIT Route
router.get("/blogs/:id/edit",middleware.checkBlogOwner, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("blogs/edit", {blog: foundBlog});
        }
    });
});

// UPDATE Route
router.put("/blogs/:id",middleware.checkBlogOwner, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if(err) {
            req.flash("error","Something went wrong");
            console.log(err);
            res.redirect("/blogs");
        } else {
            req.flash("success","Blog updated Successfully");
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DESTROY Route
router.delete("/blogs/:id",middleware.checkBlogOwner, function(req, res){
     Blog.findById(req.params.id, function(err, blog){
       if(err){
            req.flash("error","Something went wrong");
            console.log(err);
        } else {
            blog.remove();
            req.flash("success","Blog deleted Successfully");
            res.redirect("/blogs");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router ;
