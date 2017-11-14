const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const http = express();
const User = require('./models/user');
const bcrypt = require("bcrypt");
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
// http.use(passport.initialize());
// http.use(passport.session());

// passport.use(new LocalStrategy(user.authenticate()));
// passport.serializeUser(user.serializeUser());
// passport.deserializeUser(user.deserializeUser());
// http.use('/', home);
// http.use('/login', login);

http.use(session({secret: 'iloveit'}));


http.get('/', (req,res) => {
  res.render('home', {firstname: req.session.firstname});
})

http.get('/login', (req,res) => {
  res.render('login', {message: null});
})

http.post("/login", (req,res) => {
  User.findOne({email: req.body.email, password: req.body.password}, (err,user) => {
    if (err) {
      console.log(err);
    } else if (user){
      req.session.firstname = user.firstName;
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
  if (req.body.firstname && req.body.lastname && req.body.email && req.body.gender && req.body.dob && req.body.password) {

    var userData = {
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      email: req.body.email,
      gender: req.body.gender,
      dob: req.body.dob,
      password: req.body.password,
    }
    User.create({firstName: userData.firstName,lastName: userData.lastName,
                 email: userData.email,gender: userData.gender,
                 dob: userData.dob, password:userData.password}, (err,user) => {
      if (err) {
        console.log(err)
        console.log("email existed, input another one")
        res.redirect("/register");
      } else {
        req.session.firstname = userData.firstName;
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
      console.log(user[0]);
      res.render("profile", {userdata: user[0], firstname: req.session.firstname});
    })
  }

})
http.get("/profile/edit", (req,reshnbl) => {
  res.render("editprofile", {firstname: req.session.firstname});
})

http.put("/profile/edit", (req,res) => {

})

http.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/')
})

http.listen(3000, () => {
  console.log("listening to 3000");
})
