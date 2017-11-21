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
  password: {
    type : String, required : true
  },
  // applied_job : String
})


// userSchema.plugin(passportLocalMongoose);
var user = mongoose.model('User', userSchema);


module.exports = user;
