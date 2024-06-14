const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true
  },
  messages: {
    type: [Object], // Array of objects (assuming each message is an object)
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('chatroom', messageSchema);

module.exports = Message;
