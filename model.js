'use strict'

const mongoose = require('mongoose');


var userExercisesSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    index: {unique: true},
    maxlength: [20,'Too long Name!']
  },
  log: [{
    description: {
       type: String,
       require: true,
       maxlength: [20,'Too long Description!']
    },
    duration: {
       type: Number,
       required: true,
       min: [1,'Duration should be atleast 1 min']
    },
    date: {
       type: Date,
       default: Date.now
    },
    __v: false,
    _id: false
    }]
});

module.exports = mongoose.model('users',userExercisesSchema);