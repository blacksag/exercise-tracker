'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

//Router to api/exercise route
var apiRouter = require('./routes/api');
app.use('/api/exercise',apiRouter);


// Not found middleware
app.use(function (req, res, next) {
  return next({status: 404, message: 'not found'});
});

// Error Handling middleware
app.use(function (err, req, res, next) {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400 ;// bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res.status(errCode).type('txt')
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
