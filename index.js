const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const http = express();
const User = require('./models/user');
const CompanyUser = require('./models/companyuser');
const Jobs = require('./models/jobs');
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

// const home = require('./routes/home');
// const loginuser = require('./routes/loginuser');

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
// http.use('/loginuser', loginuser);

http.use(session({secret: 'iloveit'}));


http.get('/', (req,res) => {
  res.render('home', {name_user: req.session.name_user});
})

http.get('/login', (req,res) => {
    res.render('login');
})

http.get('/login/user', (req,res) => {
  res.render('loginuser', {message: null});
})

http.post("/login/user", (req,res) => {
  User.findOne({email: req.body.email, password: req.body.password, }, (err,user) => {
    if (err) {
      console.log(err);
    } else if (user){
      req.session.name_user = user.name;
      req.session.email_user = user.email;
      res.redirect("/");
    } else {
      res.send('invalid');
    }
  })
});

http.get('/company', (req,res) => {
  res.render('homecompany', {name_company: req.session.name_company});
})

http.get("/login/company", (req,res) => {
  res.render('logincompany', {message: null});
})

http.post("/login/company", (req,res) => {
  CompanyUser.findOne({email: req.body.email, password: req.body.password}, (err, user) => {
    if (err) {
      console.log(err);
    } else if (user){
      req.session.name_company = user.name;
      req.session.email_company = user.email;
      res.redirect("/company");
    } else {
      res.send('invalid');
    }
  })
})

http.get('/register' ,(req,res) => {
  res.render('register');
})
http.get("/register/user" , (req,res) => {
  res.render('registeruser');
})

http.post('/register/user', (req,res) => {
// Add more for other fields
  if (req.body.name && req.body.email && req.body.gender && req.body.dob && req.body.job_type && req.body.password) {

    var userData = {
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      dob: req.body.dob,
      hire_allow: "Yes",
      job_type: req.body.job_type,
      password: req.body.password,
    }
    User.create({name: userData.name,
                 email: userData.email,gender: userData.gender,
                 dob: userData.dob, hire_allow: userData.hire_allow, job_type: req.body.job_type, password:userData.password}, (err,user) => {
      if (err) {
        console.log(err)
        console.log("email existed, input another one")
        res.redirect("/register");
      } else {
        req.session.name_user = userData.name;
        req.session.email_user = userData.email;
        console.log("User registered")
        res.redirect("/");
      }
    })
  }
})

http.get('/register/company', (req,res) => {
  res.render('registercompany');
})

http.post("/register/company", (req,res) => {
  if(req.body.company_name && req.body.company_address && req.body.email && req.body.password) {
    var companyData = {
      name : req.body.company_name,
      address : req.body.company_address,
      email : req.body.email,
      password : req.body.password
    }
    CompanyUser.create({name: companyData.name, address: companyData.address,
    email: companyData.email, password: companyData.password}, (err,user) => {
      if (err){
        console.log(err)
        console.log("email is existed, please input another email")
        res.redirect("/register/company")
      } else if (user) {
        req.session.name_company = companyData.name;
        req.session.email_company = companyData.email;
        console.log("Company registered")
        res.redirect("/company");
      }
    })
  }
})
http.get("/profile", (req,res) => {
  if (req.session.email_user === undefined) {
    res.redirect("/login");
  } else {
    User.find({email: req.session.email_user}, (err,user) => {
      res.render("profile", {userdata: user[0], name_user: req.session.name_user});
    })
  }

})
http.get("/profile/edit", (req,res) => {
  User.findOne({email: req.session.email_user} , (err,user) => {
    if(err){
      console.log(err)
    } else if (user) {
      var userData = {
        name: user.name,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        hire_allow: user.hire_allow,
        job_type: user.job_type,
        password: user.password
      }
      res.render("editprofile", {userData: userData, name_user:req.session.name_user})
    }
  })

})

http.put("/profile/edit", (req,res) => {
  User.findOneAndUpdate({email: req.session.email_user}, { "$set": {
    "email": req.body.email,
    "dob": req.body.dob,
    "hire_allow": req.body.hire_allow,
    "job_type": req.body.job_type,
    "password": req.body.password
  }}, (err,user) => {
    if (err) {
      console.log(err);
    } else if (user) {
      //TODO : validate if email has been used or not
      // req.session.email = req.body.email;
      res.redirect("/profile");
    }
  })
})
http.get('/company/createjob', (req,res) => {
  if (req.session.name_company === undefined) {
    res.redirect("/login/company");
  } else {
    res.render("createjob", {name_company: req.session.name_company})
  }
})

http.post("/company/createjob", (req,res) => {
  if (req.body.job_title && req.body.salary && req.body.education &&
      req.body.location && req.body.job_type && req.body.minage &&
      req.body.maxage && req.body.skill && req.body.language && req.body.exp &&
      req.body.description){
        var jobData = {
          job_title : req.body.job_title,
          salary : req.body.salary,
          location : req.body.location,
          company_name : req.session.name_company,
          job_type : req.body.job_type,
          description : req.body.description,
          requirement : {
            minage : req.body.minage,
            maxage : req.body.maxage,
            experience : req.body.exp,
            education : req.body.education,
            skill : req.body.skill,
            language : req.body.language
          }
        }
        Jobs.create({title : jobData.job_title, salary: jobData.salary, location: jobData.location,
        company_name: jobData.company_name, job_type: jobData.job_type, description : jobData.description,
        requirement: {
          minAge : jobData.requirement.minage,
          maxage : jobData.requirement.maxage,
          experience : jobData.requirement.experience,
          education : jobData.requirement.education,
          skill : jobData.requirement.skill,
          language : jobData.requirement.language
        }}, (err, jobs) => {
          if (err) {
            console.log(err)
          } else {
            console.log("Job Created");
            res.redirect("/company");
          }
        })
      }
})

http.get('/jobs', (req,res) => {
    Jobs.find({}, (err,jobs) => {
      if (err){
        console.log(err)
      } else {
        res.render("jobs", {jobdata: jobs, name_user: req.session.name_user})
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
