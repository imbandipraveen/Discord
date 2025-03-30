const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  server_id: {
    type: String,
    required: true
  },
  channels: [{
    channel_id: String,
    channel_name: String,
    chat_details: [{
      content: String,
      sender_id: String,
      sender_name: String,
      sender_pic: String,
      sender_tag: String,
      timestamp: String
    }]
  }]
});

module.exports = mongoose.model('Chat', chatSchema); 