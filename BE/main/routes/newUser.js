// routes/newUser.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model

router.post('/webhook', async (req, res) => {
    console.log('Webhook received:', req.body);

    // Extract necessary fields from the payload
    const userId = req.body?.data?.id;
    const firstName = req.body?.data?.first_name;
    const lastName = req.body?.data?.last_name;
    const email = req.body?.data?.email_addresses?.[0]?.email_address;
    const profilePicture = req.body?.data?.image_url;

    if (userId && firstName && lastName && email && profilePicture) {
    try {
        // Create a new user document
        const user = new User({
        userId,
        firstName,
        lastName,
        email,
        profilePicture,
        });

        // Save the user to the database
        await user.save();
        console.log('User saved to MongoDB:', user);

        res.status(200).send({
        message: 'Webhook received successfully, storing data to MongoDB Atlas',
        data: { userId, firstName, lastName, email, profilePicture }
        });
    } catch (error) {
        console.error('Error saving user to MongoDB:', error);
        res.status(500).send({ message: 'Error saving data to MongoDB', error });
    }
    } else {
    res.status(400).send({ message: 'Invalid payload: required fields are missing' });
    }
});

module.exports = router;
