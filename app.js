'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const helmet = require('helmet');

const secret = process.env.SECRET || 'work hard';

//connect to MongoDB
mongoose.connect('mongodb://localhost:27017/node-auth', { useMongoClient: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;

//handle mongo error
db.on('error', () => {
  console.error.bind(console, 'connection error:')
});
db.once('open', function () {
  // we're connected!
  console.log("Connected to DB!");
});

// Initialize helmet
app.use(helmet());

// tell express where templates are kept.
app.set('views', './views');
// set template engine to pug
app.set('view engine', 'pug');

// Use sessions for tracking logins
app.use(session({
  secret: secret,
  resave: true,
  saveUninitialized: false,
  // moves session storage out of RAM and into Mongo
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// Include routes
const routes = require('./routes/router');

app.use('/', routes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log(404);

  const err = new Error('File not found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  console.log("Error");
  console.log(err);
  res.status(err.status || 500)
    .json({
      message: err.message,
      error: {}
    });
});

app.listen(3000, () => {
  console.log('Express app listening on port 3000');
});
