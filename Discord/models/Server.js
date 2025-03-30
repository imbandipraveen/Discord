const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  server_name: {
    type: String,
    required: [true, 'Server name is required'],
    trim: true
  },
  server_pic: String,
  users: [{
    user_name: String,
    user_profile_pic: String,
    user_tag: String,
    user_id: String,
    user_role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  categories: [{
    category_name: String,
    channels: [{
      channel_name: String,
      channel_type: {
        type: String,
        enum: ['text', 'voice'],
        required: true
      }
    }]
  }],
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Server', serverSchema); 