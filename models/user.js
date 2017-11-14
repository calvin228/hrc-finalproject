const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

var userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type : String, required : true, unique : true, lowercase : true
  },
  gender: String,
  dob: String,
  password: {
    type : String, required : true
  }
})


// userSchema.plugin(passportLocalMongoose);
var user = mongoose.model('User', userSchema);


module.exports = user;
