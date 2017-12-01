const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  email: {
    type : String, required : true, unique : true, lowercase : true
  },
  gender: String,
  dob: String,
  hire_allow: String,
  job_type: String,
  phone_number: String,
  password: {
    type : String, required : true
  },
  notification : [{sender: String, message: String, date: {type: Date, default:Date.now}}]
  // applied_job : String
})


// userSchema.plugin(passportLocalMongoose);
var user = mongoose.model('User', userSchema);


module.exports = user;
