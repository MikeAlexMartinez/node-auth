'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true
  }
});

// authenticate input against the database
UserSchema.statics.authenticate = (email, password, cb) => {
  User.findOne({ email: email })
    .exec((err, user) => {
      // if error or no user retrieved
      if (err) return cb(err);
      if (!user) {
        const err = Error('user not found.');
        err.status = 401;
        return cb(err);
      }

      console.log("checking password");
      bcrypt.compare(password, user.password, (err, result) => {
        if (result === true) return cb(null, user);
        
        console.log("Password doesn't match");
        return cb();
      });
    });
};

// hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
  const user = this;
  bcrypt.hash(user.password, 12, (err, hash) => {
    if (err) return next(err);

    user.password = hash;
    next();
  });
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
