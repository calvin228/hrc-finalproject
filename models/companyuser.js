const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

var companySchema = new Schema({
  name: String,
  address: String,
  email: {
    type : String, required : true, unique : true, lowercase : true
  },
  password: {
    type : String, required : true
  }
})


// userSchema.plugin(passportLocalMongoose);
var company = mongoose.model('Company', companySchema);


module.exports = company;
