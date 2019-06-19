'use strict'

var express = require('express');
var route = express.Router();
var Users = require('../model.js');
const shortid = require('shortid');



route.get('/log', function (req, res, next) {
  // return users information of exercise
  var userId = req.query.userId;
  if (!userId) {
    return next({
      status: 400,
      message: 'User id can not be empty!'
    });
  }
  
  Users.findById(userId, function (err, data) {
    if (err) {
      console.log('Error while fetching user log!');
      return next(err);
    }
    
    if (!data) {
      console.log('Invalid user id given!');
      return next({
        status: 400,
        message: 'invalid user id'
      });
    }
    
    // if data found then fetch the details
    var from = req.query.from ? new Date(req.query.from) : new Date(-8640000000000000);
    var to = req.query.to ? new Date(req.query.to) : new Date();
    
    if (from == 'Invalid Date' || to == 'Invalid Date') {
      console.log('Invalid date given!');
      return next({
        status: 400,
        message: 'invalid date'
      });
    }
    
    var limit = req.query.limit ? req.query.limit : 'null';
    
    if (isNaN(req.query.limit)) {
      console.log('Invalid limit given!');
      return next({
        status:400,
        message: 'invalid limit'
      })
    }
    
    var newLog = data.log;
    newLog = newLog.filter(data => (data.date>= from && data.date<=to));
    newLog = newLog.sort((first,second) => (first.date>second.date));
    newLog = newLog.map(item => ({
                            description: item.description,
                            duration: item.duration,
                            date: item.date.toDateString()
                          }));
    
    if(limit!='null'  && newLog.length >= limit) {
        newLog = newLog.slice(0, limit);
     }

    const send = {
          _id: data._id,
          username: data.username,
          from : req.query.from ? from.toDateString() : undefined,
          to : req.query.to ? to.toDateString(): undefined,
          count: newLog.length,
          log: newLog};
    res.json(send);
  });
});



route.get('/users', function (req, res, next) {
  //return a json array of all users registered
  Users.find({}, {log: false}, function (err,data) {
    if (err) {
      console.log('Error while retriving users data!');
      return next(err);
    }
    res.json(data);
  });
});



route.post('/new-user', function (req, res, next) {
  //add a new user to the database
  
  var username = req.body.username;
  var user = new Users({_id: shortid.generate(),username : username});
  
//   Users.findOne({username: username}, function (err,data) {
//     if (err) {
//       console.log('Error while checking user already present!');
//       next(err);
//     }
//     else if (data) {
      
//       console.log('i have been here');
//       next({
//           status: 400,
//           message: 'Username Already Taken!'
//         });
//       console.log('i have been here too');
//     }
    
//     else {
//       //save the user
      
//       user.save(function (err,data) {
//         if (err) {
//           console.log('Error while saving username!');
//           next(err);
//         }
//         res.json({
//           username: data.username,
//           _id: data._id
//         });
//       });
//     }
//   });
  
  user.save(function(err,data) {
    if (err) {
      if (err.code == 11000) {  // uniqueness error in mongoDB
        return next({
          status: 400,
          message: 'Username Already Taken!'
        });
      }
      else {
        console.log('Error while saving username!');
        return next(err);
      }
    }

    res.json({
      username: data.username,
      _id: data._id
    });
  });
});



route.post('/add', function (req, res, next) {
  //add new exercise or task for the give user
  var log = {
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date) : new Date()
    }
  
  var userId = req.body.userId;
  if (!userId) 
    return next({
      status: 400,
      message: 'userId cannot be empty!'
    });
  
  if (!log.description || !log.duration) 
    return next({
      status: 400,
      message: 'duration and description can not be empty!'
    });
    
  
  Users.findByIdAndUpdate(userId, {$push: {log: log}}, 
                          {new: true, runValidators: true, setDefaultsOnInsert: true}, 
                          function (err, data) {
    if (err) {
      console.log('Error while updating log!');
      return next(err);
    }
    
    if (!data) {
      console.log('User not found!');
      return next({
        status: 400,
        message: 'unknown _id'
      });
    }
    
//    data.log.push(log);
//    data.save();
//    console.log(data);
    res.json({
    username: data.username,
    description: log.description,
    duration: log.duration,
    _id: data._id,
    date: log.date.toDateString()
    });
  });
});



module.exports = route;