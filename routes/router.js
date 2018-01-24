'use strict';

const path = require('path');

const express = require('express');
const router = express.Router();

const User = require('../models/users');

router.get('/', isLoggedIn, (req, res, next) => {
  
});

router.get('/home', (req, res) => {
  console.log('/home');
  return res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

router.post('/',(req, res, next) => {
  console.log('POST /');
  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {
    
    console.log("REGISTER");
    //////////////////////////////////////
    // should verify user input data here!
    //////////////////////////////////////
    if (req.body.password !== req.body.passwordConf) {
      const err = new Error('Passwords do no match');
      err.status = 400;
      res.send('passwords don\'t match');
      return next(err);
    }

    //////////////////////////////////////

    const userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    };

    User.create(userData, (err, user) => {
      if (err) {
        return next(err);
      }
      req.session.userId = user._id;
      return res.redirect('/profile');
    });
  
  } else if (req.body.logemail && req.body.logpassword) {
    console.log("LOGIN");

    User.authenticate(req.body.logemail, req.body.logpassword, (err, user) => {
      if (err || !user) {
        // Give 
        const err = new Error('Wrong email or password');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId - user._id;
        return res.redirect('/profile');
      }
    });

  } else {
    
    const err = new Error('All fields required.');
    err.status = 400;
    return next(err);

  }
});

router.get('/profile', (req, res, next) => {
  console.log("Profile");
  User.findById(req.session.userId)
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) {
        const err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      }
      return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  console.log("Logout");
  if (req.session) {
    console.log(req.session);
    // delete session object
    req.session.destroy( function(err) {
      if (err) {
        console.log(err);
        return next(err);
      } else {
        return res.redirect('/home');
      }
    });
  } else {
    console.log("no session");
    const err = new Error('no session to logout from');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;

// is logged in
function isLoggedIn(req, res, next) {
  console.log("isLoggedIn");
  
  // check for req.session.userId
  

    //check if valid user id
    User.findById(req.session.userId)
      .exec((err, user) => {
        if (err) return next(err);
        if (!user) {
          const err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        }
        return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
      });
}


// example of login middleware
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    const err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

/*
router.get('/profile', mid.requiresLogin, function(req, res, next) {
  //...
});
*/