const express = require('express');
const router = express.Router();
const Message = require('../models/Messages');

// Route to get all messages for a specific transactionId
router.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    console.log(`Fetching messages for transactionId: ${transactionId}`);
    const messageDoc = await Message.findOne({ transactionId });
    if (!messageDoc) {
      return res.status(404).json({ msg: 'Messages not found' });
    }
    res.json(messageDoc.messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).send('Server Error');
  }
});

// Route to post a new message to a specific transactionId
router.post('/', async (req, res) => {
  try {
    const { transactionId, message } = req.body;
    if (!transactionId || !message) {
      return res.status(400).json({ msg: 'Please include transactionId, and message' });
    }

    console.log(`Posting a new message for transactionId: ${transactionId}`);
    let messageDoc = await Message.findOne({ transactionId });

    if (!messageDoc) {
      // Create a new document if none exists
      messageDoc = new Message({
        transactionId,
        messages: [message]
      });
    } else {
      // Append the new message to the existing messages array
      messageDoc.messages.push(message);
    }

    await messageDoc.save();
    res.status(201).json(messageDoc.messages);
  } catch (error) {
    console.error('Error posting message:', error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
