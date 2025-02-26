var express= require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
var Blog=require("../models/blog");

router.get("/", function(req, res){
    res.redirect("/blogs");
});

router.get("/register",function(req, res){
  res.render("register");
})

router.post("/register",function(req, res){
  var newUser= new User(
    {
      username: req.body.username,
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      email:req.body.email,
      avatar:req.body.avatar
  });
  User.register(newUser, req.body.password , function(err, user){
    if(err){
      console.log(err);
      req.flash("error",err.message);
      return res.render("register");
    }
    passport.authenticate("local")(req, res , function(){
      req.flash("success","Welcome " + user.username);
       res.redirect("/blogs");
    });
  });
});

router.get("/login",function(req, res){
  res.render("login");
})

router.post("/login",passport.authenticate("local",  {
  successRedirect: "/blogs",
  failureRedirect:"/login"
}),function(req, res){
});

router.get("/logout",function(req, res){
  req.logout();
  req.flash("success","Logged you out!");
  res.redirect("/blogs");
});

router.get("/users/:id",function(req, res){
  User.findById(req.params.id, function(err, foundUser){
    if(err){
      req.flash("error","Something went wrong");
      res.redirect("/");
    }else{
      Blog.find().where('author.id').equals(foundUser._id).exec(function(err, blogs){
        if(err){
          req.flash("error","Something went wrong");
          res.redirect("/");
        } else {
          res.render("users/show",{user: foundUser, blogs:blogs});
        }
    });
    }
  });
});

module.exports = router ;
