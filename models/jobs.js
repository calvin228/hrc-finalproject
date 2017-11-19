const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

var jobsSchema = new Schema({
  title : String,
  salary : Number,
  location : String,
  company_name : String,
  job_type : String,
  description : String,
  requirement : {
    minAge : Number,
    maxAge : Number,
    experience : Number,
    education : String,
    skill : String,
    language : String,
  }
  // job title, salary, location, company name, job type, requirement
})


// userSchema.plugin(passportLocalMongoose);
var jobs = mongoose.model('Jobs', jobsSchema);


module.exports = jobs;
