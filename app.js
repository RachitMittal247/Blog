var express = require("express"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    app = express(),
    flash=require("connect-flash"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    User=require("./models/user"),
    Blog=require("./models/blog"),
    Comment=require("./models/comment"),
    seedDB=require("./seeds");

var blogRoutes=require("./routes/blogs"),
    commentRoutes=require("./routes/comments"),
    indexRoutes=require("./routes/index");

// APP Config
//seedDB();
//mongoose.connect('mongodb://localhost:27017/blog_app', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://dhruvmalik:dhruv2002@blog-app.yvbmp.mongodb.net/blog_app?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(flash());

// Passport Configuration
app.use(require("express-session")({
  secret:"my name is dhruv",
  resave:false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error =req.flash("error");
  res.locals.success =req.flash("success");
  next();
});

app.use(indexRoutes);
app.use(commentRoutes);
app.use(blogRoutes);

var port=process.env.PORT || 3000;
app.listen(port, function() {
    console.log("The BlogApp Server has Started!!!");
});
