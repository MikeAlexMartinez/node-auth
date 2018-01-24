'use strict';

const express = require('express');
const app = express();

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// Include routes
const routes = require('./routes/router');
app.use('/', routes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('File not found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500)
    .json({
      message: err.message,
      error: {}
    });
});

app.listen(3000, () => {
  console.log('Express app listening on port 3000');
});
