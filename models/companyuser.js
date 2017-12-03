const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

var companySchema = new Schema({
  name: String,
  address: String,
  account_name : String,
  account_number : String,
  email: {
    type : String, required : true, unique : true, lowercase : true
  },
  password: {
    type : String, required : true
  },
  phone_number: String,
  image: String
})


// userSchema.plugin(passportLocalMongoose);
var company = mongoose.model('Company', companySchema);


module.exports = company;
