const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = express();

http.set('views','views');
http.set('view engine','ejs');

const home = require('./routes/home');
const login = require('./routes/login');


http.use(bodyParser.json());
http.use(bodyParser.urlencoded({extended: false}));
// http.use('/', home);
// http.use('/login', login);

http.use(session({secret: 'iloveit'}));

http.get('/', (req,res) => {
  res.render('home', {user: req.session.user});
})

// http.get('/', (req,res) => {
//   if(! req.session.user) { // dicek apakah ada data usernya atau blm, "session" ada di server
//     res.redirect('/login');
//   } else {
//     res.render('protected', {user: req.session.user})
//   }
// });

http.get('/login', (req,res) => {
  res.render('login', {message: null});
})

http.post('/login', (req,res,next) => {
  const user = req.body.user;
  const password = req.body.password;

  if(password !== 'rahasia' || user === ''){
    res.render('login', {message: "Access Denied!"})
  } else {
    req.session.user = user;
    res.redirect('/');

  }
})

// http.get('/logged', (req,res) => {
//   if (req.session.email) {
//     res.write('<h1>Logged In</h1><a href="/logout">Logout</a>');
//     res.end();
//   } else {
//     res.write('<h1>User not logged In</h1><a href="/">Main Page</a>');
//   }
// })

http.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/')
})

http.listen(3000, () => {
  console.log("listening to 3000");
})
