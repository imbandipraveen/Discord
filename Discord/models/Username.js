const mongoose = require('mongoose');

const usernameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('Username', usernameSchema); 