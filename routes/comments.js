var express= require("express");
var router=express.Router();
var Blog=require("../models/blog");
var Comment=require("../models/comment");
var middleware=require("../middleware");

router.get("/blogs/:id/comments/new",middleware.isLoggedIn, function(req, res){
  Blog.findById(req.params.id, function(err , blog) {
    if(err){
      console.log(err);
    }else{
        res.render("comments/new", {blog: blog});
    }
  })
})

router.post("/blogs/:id/comments",middleware.isLoggedIn, function(req, res){
  Blog.findById(req.params.id, function(err , blog) {
    if(err){
      req.flash("error","Blog not found");
      console.log(err);
      redirect("/blogs");
    }else{
        Comment.create(req.body.comment, function(err, comment){
          if(err){
            req.flash("error","Something went wrong");
            console.log(err);
          }else{
            comment.author.id= req.user._id;
            comment.author.username=req.user.username;
            comment.save();
            blog.comments.push(comment);
            blog.save();
            req.flash("success","Comment added Successfully");
            res.redirect('/blogs/'+ blog._id);
          }
        })
    }
})
});

//destroy routes
router.delete("/blogs/:id/comments/:comment_id" ,middleware.checkCommentOwner, function(req, res){
     Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("back");
        } else {
            req.flash("success","Comment deleted Successfully");
            res.redirect("/blogs/" + req.params.id);
        }
    });
});



module.exports = router ;
