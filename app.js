var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var Review = require("./models/review");
var bodyParser = require("body-parser");
var User = require("./models/user");
const port = process.env.PORT || 5500;
process.env.MONGO_URL="mongodb+srv://campuseats:campuseats@cluster0-kkpdt.mongodb.net/MovieDB?retryWrites=true&w=majority";
mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true });
app.use(express.static("public"));
var search,content;
app.use(bodyParser.urlencoded({extended:true}));
app.listen(process.env.PORT||5500,function(){
  console.log(`listeneing on port ${process.env.PORT||5500}`);
});
app.use(require("express-session")({
  secret:"secret",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  next();
});
//routes
app.get("/",function(req,res){
  res.render("home.ejs");
  console.log(req.user);
  console.log("Home page");
});
app.get("/search",isLoggedIn,function(req,res){
  res.render("search.ejs");
});
app.post("/results",function(req,res){
  search = req.body.search;
  request("http://www.omdbapi.com/?apikey=852159f0&s=" + search + "&plot=full",function(error,response,body){
   if(!error && response.statusCode==200){
   content = JSON.parse(body);
     res.render("results.ejs",{content:content.Search,search,response:content.Response});

   }else{
     console.log("error!!!");
   }
 });
});
app.get("/results/:id",function(req,res){
  request("http://www.omdbapi.com/?apikey=852159f0&i=" + req.params.id + "&plot=full",function(error,response,body){
    if(!error && response.statusCode == 200){
    var movie = JSON.parse(body);
    res.render("show.ejs",{movie:movie});
  }else{
    console.log("error");
    res.redirect("back");
  }
  });
});
app.get("/info",function(req,res){
  res.render("info.ejs");
});
//review routes
app.get("/reviews",isLoggedIn,function(req,res){
  Review.find({},function(err,reviews){
    if(err){
      res.redirect("back");
    }else {
      res.render("reviews.ejs",{reviews:reviews});
    }
  });
});
app.post("/reviews",function(req,res){
  var obj = {author:req.body.author,content:req.body.content};
  Review.create(obj,function(err,re){
    if(err){
      res.redirect("back");
    }else {
      res.redirect("/reviews");
    }
  });
});
app.get("/signup",function(req,res){
  res.render("signup.ejs");
});
app.post("/signup",function(req,res){
  User.register(new User({username:req.body.username}),req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/signup");
    }else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/");
      });
    }
  });
});
app.get("/login",function(req,res){
  res.render("login.ejs");
});
app.post("/login",passport.authenticate("local",{successRedirect:"/",failureRedirect:"/login"}),function(req,res){
  console.log("user logged in");
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/login");
  }
}
