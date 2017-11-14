const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const http = express();
const User = require('./models/user');
const methodOverride = require("method-override");
// const bcrypt = require("bcrypt");
// const passport = require('passport');
// const LocalStrategy   = require('passport-local');
// const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect("mongodb://localhost/hrc");
mongoose.connection.once('open', () => {
  console.log('Connection to database success');
}).on('error', (err) => {
  console.log('Connection error');
})

http.set('views','views');
http.set('view engine','ejs');

const home = require('./routes/home');
const login = require('./routes/login');

http.use(express.static('public'));
http.use(bodyParser.json());
http.use(bodyParser.urlencoded({extended: true}));
http.use(methodOverride("_method"));
// http.use(passport.initialize());
// http.use(passport.session());

// passport.use(new LocalStrategy(user.authenticate()));
// passport.serializeUser(user.serializeUser());
// passport.deserializeUser(user.deserializeUser());
// http.use('/', home);
// http.use('/login', login);

http.use(session({secret: 'iloveit'}));


http.get('/', (req,res) => {
  res.render('home', {name: req.session.name});
})

http.get('/login', (req,res) => {
  res.render('login', {message: null});
})

http.post("/login", (req,res) => {
  User.findOne({email: req.body.email, password: req.body.password}, (err,user) => {
    if (err) {
      console.log(err);
    } else if (user){
      req.session.name = user.name;
      req.session.email = user.email;
      res.redirect("/");
    } else {
      res.send('invalid');
    }
  })
});


http.get('/register' ,(req,res) => {
  res.render('register');
})

http.post('/register', (req,res) => {
// Add more for other fields
  if (req.body.name && req.body.email && req.body.gender && req.body.dob && req.body.password) {

    var userData = {
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      dob: req.body.dob,
      password: req.body.password,
    }
    User.create({name: userData.name,
                 email: userData.email,gender: userData.gender,
                 dob: userData.dob, password:userData.password}, (err,user) => {
      if (err) {
        console.log(err)
        console.log("email existed, input another one")
        res.redirect("/register");
      } else {
        req.session.name = userData.name;
        req.session.email = userData.email;
        console.log("User registered")
        res.redirect("/");
      }
    })
  }
})

http.get("/profile", (req,res) => {
  // TODO : fix double profile path
  if (req.session.email === undefined) {
    res.redirect("/login");
  } else {
    User.find({email: req.session.email}, (err,user) => {
      res.render("profile", {userdata: user[0], name: req.session.name});
    })
  }

})
http.get("/profile/edit", (req,res) => {
  User.findOne({email: req.session.email} , (err,user) => {
    if(err){
      console.log(err)
    } else if (user) {
      var userData = {
        name: user.name,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        password: user.password
      }
      res.render("editprofile", {userData: userData, name:req.session.name})
    }
  })

})

http.put("/profile/edit", (req,res) => {
  User.findOneAndUpdate({email: req.session.email}, { "$set": {
    "name": req.body.name,
    "email": req.body.email,
    "dob": req.body.dob,
    "password": req.body.password
  }}, (err,user) => {
    if (err) {
      console.log(err);
    } else if (user) {
      // validate if email has been used or not
      // req.session.email = req.body.email;
      res.redirect("/profile");
    }
  })
})

http.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/')
})

http.listen(3000, () => {
  console.log("listening to 3000");
})
