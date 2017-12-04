const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const http = express();
const User = require('./models/user');
const CompanyUser = require('./models/companyuser');
const Jobs = require('./models/jobs');
const Comments = require("./models/comments");
const methodOverride = require("method-override");
const QuickHire = require("./models/quickhire");
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
  res.render('home', {name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user});
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
      req.session.image_user = user.image;
      if (req.session.returnPath) {
        res.redirect(req.session.returnPath);
      } else {
        req.session.returnPath = "/";
        res.redirect(req.session.returnPath);
      }

    } else {
      // TODO : CHANGE THIS ONE TO MESSAGE
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
      req.session.address_company = user.address;
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
  if (req.body.name && req.body.email && req.body.location && req.body.gender && req.body.dob && req.body.phone && req.body.image && req.body.quickhire && req.body.address && req.body.password) {

    var userData = {
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      dob: req.body.dob,
      location: req.body.location,
      phone_number: req.body.phone,
      hire_allow: "Yes",
      image: req.body.image,
      address: req.body.address,
      quickhire: req.body.quickhire,
      password: req.body.password,
    }
    User.create({name: userData.name,
                 email: userData.email,gender: userData.gender,
                 location: userData.location,
                 dob: userData.dob, hire_allow: userData.hire_allow,
                 phone_number: userData.phone_number, image: userData.image,
                 quickhire: userData.quickhire, address: userData.address, password:userData.password}, (err,user) => {
      if (err) {
        console.log(err)
        console.log("email existed, input another one")
        res.redirect("/register");
      } else {
        req.session.name_user = userData.name;
        req.session.email_user = userData.email;
        req.session.image_user = userData.image;
        console.log("User registered")
        User.findOneAndUpdate({email: req.session.email_user}, {$push: {notification: {sender: "HRC Bot",
          message: "Thank you for register to HRC , and welcome to HRC. Good luck on finding your new job"}}}, (err, user) => {
              if (err){
                console.log(err)
              } else {
                res.redirect("/");
              }
          })
      }
    })
  }
})

http.get('/register/company', (req,res) => {
  res.render('registercompany');
})

http.post("/register/company", (req,res) => {
  if(req.body.company_name && req.body.company_address && req.body.image && req.body.account_name && req.body.account_number && req.body.phone_number && req.body.email && req.body.password) {
    var companyData = {
      name : req.body.company_name,
      address : req.body.company_address,
      image : req.body.image,
      account_name : req.body.account_name,
      account_number : req.body.account_number,
      email : req.body.email,
      phone_number: req.body.phone_number,
      password : req.body.password
    }
    CompanyUser.create({name: companyData.name, address: companyData.address, image: companyData.image, account_name: companyData.account_name, account_number: companyData.account_number,
    email: companyData.email, phone_number: companyData.phone_number, password: companyData.password}, (err,user) => {
      if (err){
        console.log(err)
        console.log("email is existed, please input another email")
        res.redirect("/register/company")
      } else if (user) {
        req.session.name_company = companyData.name;
        req.session.email_company = companyData.email;
        req.session.image_company = companyData.image;
        req.session.address_company = companyData.address;
        console.log("Company registered")
        res.redirect("/company");
      }
    })
  }
})
http.get("/profile", (req,res) => {
  // Validate if user has login
  if (req.session.email_user === undefined) {
    req.session.returnPath = req.path;
    console.log(req.session.returnPath);
    res.redirect("/login");
  } else {
    User.find({email: req.session.email_user}, (err,user) => {
      res.render("profile", {userdata: user[0], name_user: req.session.name_user, image_user: req.session.image_user});
    })
  }

})
http.get("/profile/edit", (req,res) => {
  // validate if user has login
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
          phone_number: user.phone_number,
          password: user.password
        }
        res.render("editprofile", {userData: userData, name_user:req.session.name_user})
      }
    })
  } else {
    req.session.returnPath = req.path;
    console.log(req.session.returnPath);
    res.redirect('/login/user')
  }

})

http.put("/profile/edit", (req,res) => {
  User.findOneAndUpdate({email: req.session.email_user}, { "$set": {
    "email": req.body.email,
    "dob": req.body.dob,
    "phone_number": req.body.phone,
    "hire_allow": req.body.hire_allow,
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
      req.body.location && req.body.minage &&
      req.body.maxage && req.body.skill && req.body.language && req.body.exp &&
      req.body.description){
        var jobData = {
          job_title : req.body.job_title,
          salary : req.body.salary,
          location : req.body.location,
          company_email : req.session.email_company,
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
        company_email: jobData.company_email, description : jobData.description,
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
          res.render("jobs", {jobdata: jobs, name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user})
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
        res.render("jobdetail", {jobdata: jobs, name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user})
      }
    })
  } else {
    req.session.returnPath = req.path;
    console.log(req.session.returnPath);
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
      res.redirect("/jobs")
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
        res.render("jobs", {jobdata: jobs, name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user});
      }
    })
  }
})

http.get("/about", (req,res) => {
  res.render("about", {name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user})
})

// http.get("/filter", (req,res) => {
//   var filter = req.query.filter;
//   var subfilter = req.query.subfilter;
//   if (filter === "job_type"){
//     Jobs.find({"job_type" : subfilter}, (err,jobs) => {
//       if (err){
//         console.log(err)
//       } else {
//         res.render("jobs", {jobdata: jobs, name_user: req.session.name_user, email_user: req.session.email_user,
//         image_user: req.session.image_user});
//       }
//     })
//   } else {
//     Jobs.find({filter: subfilter}, (err,jobs) => {
//       if (err){
//         console.log(err)
//       } else {
//         res.render("jobs", {jobdata: jobs, name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user})
//       }
//     })
//   }
//
//   // console.log(req.query.filter);
//   // console.log(req.query.subfilter);
// })
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
  // TODO : show date and time message received
  User.find({email: req.session.email_user}, (err,user) => {
    if(err) {
      console.log(err)
    } else {
      res.render("messages", {name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user, userdata: user[0]})
    }
  })
})


http.get("/academy", (req,res) => {
  res.render('academy', {name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user})
  // Comments.find({}, (err,comment) => {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     res.render("academy", {commentData: comment, name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user});
  //   }
  // })

})

http.get("/academy/detail/:id" , (req,res) => {
  var id = req.params.article_id;
  Comments.find({}, (err,comment) => {
    if (err) {
      console.log(err)
    } else {
      res.render("academydetail", {commentData: comment, name_user: req.session.name_user, email_user: req.session.email_user, image_user: req.session.image_user});
    }
  })
})

http.post("/academy/detail/:id", (req,res) => {
  var id = req.params.id;
  if (req.body.comment && req.session.name_user){
      Comments.create({article_id: id, comment: req.body.comment, person: {name: req.session.name_user, email: req.session.email_user, image: req.session.image_user}}, (err,comment) => {
        if (err){
          console.log(err)
        } else {
          res.redirect("/academy/detail/"+id);
        }
      })
  } else {
    res.redirect("/login/user");
  }
})

http.delete("/academy/details/:article_id/:id", (req,res) => {
  var article_id = req.params.article_id;
  var id = req.params.id
  Comments.findOneAndDelete({_id : id, article_id: article_id}, (err,comment) => {
    if (err){
      console.log(err)
    } else {
      res.redirect('/academy');
    }
  })
})



http.get('/company/quickhire', (req,res) => {
  if( req.session.name_company) {
    res.render("quickhire", {name_company: req.session.name_company, email_company: req.session.email_company});
  } else {
    res.redirect("/login/company");
  }

})

http.get('/api/company/quickhire', (req,res) => {
  User.find({location: req.query.location, quickhire: req.query.job_title}, (err,user) => {
    if(err){
      console.log(err)
    } else {
      res.send(user);
    }
  })
})

http.post("/company/quickhire/hire/:id", (req,res) => {
  var id = req.params.id;
  User.findOneAndUpdate({_id: id}, {$push: {notification: {sender: req.session.name_company,
    message: "You have been hired by "+req.session.name_company+" as a '"+req.body.job_title+"' on "+req.body.date+" with payment of "+req.body.salary+"/day. Please contact "+req.session.phone_company+" for confirmation", detailed: {
      job_type: req.body.job_type, work_time: req.body.date, salary: req.body.salary, location: req.body.location}
    }}}, (err, user)=>{
      if (err){
        console.log(err)
      } else {
        User.findOneAndUpdate({_id: id}, {$set: {hire_allow: "No"}}, (err,user) => {
          if (err){
            console.log(err)
          } else {
            QuickHire.create({job_title: req.body.job_title, salary:req.body.salary, location:req.body.location, candidate_id: id, company_name: req.session.name_company, company_address: req.session.address_company, work_date: req.body.date}, (err,result) => {
              if (err){
                console.log(err)
              } else {
                res.redirect('/company/quickhire');
              }
            })
          }
        })
      }
    })

})

http.listen(3000, () => {
  console.log("listening to 3000");
})

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
