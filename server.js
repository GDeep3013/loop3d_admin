const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config()


// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: 'http://localhost:3000', // Specify the allowed origin(s)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials (cookies, authorization headers)
  optionsSuccessStatus: 204, 
  allowedHeaders: 'Content-Type,Authorization', // Specify allowed headers
};

app.use(cors());

async function connectDB() {
  try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connection established');
  } catch (error) {
      console.error('Error connecting to MongoDB', error);
      process.exit(1); // Exit process with failure
  }
}

connectDB();

app.use('/', authRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
