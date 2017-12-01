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
  // TODO : redirect to previous opened page if possible
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
      req.session.phone_company = user.phone_number;
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
  if (req.body.name && req.body.email && req.body.gender && req.body.dob && req.body.phone && req.body.job_type && req.body.password) {

    var userData = {
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      dob: req.body.dob,
      phone_number: req.body.phone,
      hire_allow: "Yes",
      job_type: req.body.job_type,
      password: req.body.password,
    }
    User.create({name: userData.name,
                 email: userData.email,gender: userData.gender,
                 dob: userData.dob, hire_allow: userData.hire_allow, job_type: req.body.job_type,
                 phone_number: userData.phone_number, password:userData.password}, (err,user) => {
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
  if(req.body.company_name && req.body.company_address && req.body.phone_number && req.body.email && req.body.password) {
    var companyData = {
      name : req.body.company_name,
      address : req.body.company_address,
      email : req.body.email,
      phone_number: req.body.phone_number,
      password : req.body.password
    }
    CompanyUser.create({name: companyData.name, address: companyData.address,
    email: companyData.email, phone_number: companyData.phone_number, password: companyData.password}, (err,user) => {
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
  if (req.session.name_user) {
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
          phone_number: user.phone_number,
          password: user.password
        }
        res.render("editprofile", {userData: userData, name_user:req.session.name_user})
      }
    })
  } else {
    res.redirect('/login/user')
  }

})

http.put("/profile/edit", (req,res) => {
  User.findOneAndUpdate({email: req.session.email_user}, { "$set": {
    "email": req.body.email,
    "dob": req.body.dob,
    "phone_number": req.body.phone,
    "hire_allow": req.body.hire_allow,
    "job_type": req.body.job_type,
    "password": req.body.password
  }}, (err,user) => {
    if (err) {
      console.log(err);
    } else if (user) {
      //TODO : validate if email has been used or
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
          company_email : req.session.email_company,
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
        company_email: jobData.company_email, job_type: jobData.job_type, description : jobData.description,
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

http.get("/jobs/:id", (req,res) => {
  if (req.session.name_user){
    var id = req.params.id

    Jobs.findOne({_id: id}, (err,jobs) => {
      if (err) {
        console.log(err)
      } else {
        res.render("jobdetail", {jobdata: jobs, name_user: req.session.name_user, email_user: req.session.email_user})
      }
    })
  } else {
    res.redirect("/login/user");
  }

})

http.put("/jobs/:id", (req,res) => {
  var id = req.params.id;
  Jobs.findOneAndUpdate({_id: id},{ $push : {candidate: {email: req.session.email_user,
  name: req.session.name_user, status: "In Process"}}},(err,jobs) => {
    if (err) {
      console.log(err)
    } else {
      //TODO : Validate if user has login or not (DONE)
      res.send("Job Applied ");
    }
  })

})

http.get("/search", (req,res) => {
  var search = req.body.search;
  if (req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Jobs.find({"title": regex}, (err, jobs) => {
      if (err){
        console.log(err)
      } else {
        res.render("jobs", {jobdata: jobs, name_user: req.session.name_user, email_user: req.session.email_user});
      }
    })
  }
})
http.get("/company/jobstatus", (req,res) => {
  if (req.session.name_company) {
    Jobs.find({company_email: req.session.email_company}, (err,jobs) => {
      if (err) {
        console.log(err)
      } else {
        res.render("jobstatus", {jobdata: jobs, name_company: req.session.name_company, email_company: req.session.email_company})
      }
    })
  } else {
    res.redirect("/login/company");
  }
})

http.get("/company/jobstatus/:id", (req,res) => {
  var id = req.params.id
  if (req.session.name_company){
    Jobs.findOne({_id: id}, (err, jobs) => {
      if (err) {
        console.log(err)
      } else {
        res.render("jobstatusdetail", {jobdata: jobs, name_company: req.session.name_company, email_company: req.session.email_company})
      }
    })
  }
})

http.post("/company/jobstatus/:id/:cand_email", (req,res) => {
  var id = req.params.id;
  var cand_email = req.params.cand_email;
  Jobs.findOneAndUpdate({_id: id, "candidate": {$elemMatch: {email: cand_email }}},
  {$set: {"candidate.$.status":req.body.decision}}, (err, result) => {
    // TODO : make a message feature and disable button for decision
    if(err) {
      console.log(err);
    } else {

      if (req.body.decision === "Process to Interview") {
        User.findOneAndUpdate({email: cand_email}, {$push: {notification: {sender: req.session.name_company,
          message: "You are welcomed to proceed to Interview, please call " + req.session.phone_company + " for more information"}}}, (err, user) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect("/company/jobstatus/"+id);
          }

        })
      } else if (req.body.decision === "Reject") {
        User.findOneAndUpdate({email: cand_email}, {$push: {notification: {sender: req.session.name_company,
          message: "You are rejected because of unable to fulfill the requirements or else"}}}, (err, user) => {
          if (err) {
            console.log(err)
          } else {
            console.log(user);
            res.redirect("/company/jobstatus/"+id);
          }

        })
      }

    }
  })
})

http.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/')
})

http.get("/messages", (req,res) => {
  // TODO : how to sort array by date (DONE)
  User.find({email: req.session.email_user}, (err,user) => {
    if(err) {
      console.log(err)
    } else {
      res.render("messages", {name_user: req.session.name_user, email_user: req.session.email_user, userdata: user[0]})
    }
  })
})

http.listen(3000, () => {
  console.log("listening to 3000");
})

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
