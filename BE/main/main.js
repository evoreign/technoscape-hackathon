const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the CORS middleware
const Message = require('./models/Messages'); // Adjust path as per your file structure

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

// Middleware to handle CORS
app.use(cors({
  origin: '*', // Allows requests from any origin. Use specific domains in production.
  methods: ['GET', 'POST'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Enable credentials if needed
}));

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb+srv://kopi:kopi@user.oy64umi.mongodb.net/?retryWrites=true&w=majority&appName=user';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('Failed to connect to MongoDB Atlas', err);
});

// Define routes
app.get('/', (req, res) => {
  res.send('Hello there! API is up and running');
});

const newUserRoute = require('./routes/newUser');
app.use('/user', newUserRoute);

const chatRoute = require('./routes/chat');
app.use('/chat', chatRoute);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
