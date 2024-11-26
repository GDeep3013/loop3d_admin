const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config()

const bodyParser = require('body-parser');

// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '50mb' }));  // Adjust '50mb' as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
/**
 * Import Middleware
*/
const authenticateHeaderKey = require('./app/middlewares/auth');
const User = require('./app/models/User.js');

/**Import Routes */
const authRoutes = require('./routes/auth.js');
const usersRoutes = require('./routes/usersRoutes');
const organizationRoutes = require('./routes/organization');
const categoryRoutes = require('./routes/categoryRoutes');
const questionRoutes = require('./routes/questionRoutes');
const assignCompetencyRoutes = require('./routes/assignCompetencyRoutes');
const surveyRoutes = require('./routes/surveyRoutes');// Adjust path as necessary
const emailRoutes = require('./routes/emailRoutes');// Adjust path as necessary
const goalsRoutes = require('./routes/goalRoutes');
const imagesRoutes = require('./routes/surveyImageRoutes');







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
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
    });
      console.log('MongoDB connection established');
  } catch (error) {
      console.error('Error connecting to MongoDB', error);
      process.exit(1); // Exit process with failure
  }
}

connectDB();
/**
 * System Routes
*/
app.use('/', authRoutes);

app.use('/users', authenticateHeaderKey, usersRoutes);
app.use('/organizations', authenticateHeaderKey, organizationRoutes);
app.use('/categories', authenticateHeaderKey, categoryRoutes);
app.use('/questions', authenticateHeaderKey, questionRoutes);
app.use('/competencies', authenticateHeaderKey, assignCompetencyRoutes);
app.use('/surveys', surveyRoutes);
app.use('/emails', authenticateHeaderKey, emailRoutes);
app.use('/plans', authenticateHeaderKey, goalsRoutes);
app.use('/images', authenticateHeaderKey, imagesRoutes);
app.get('/removeuser', async (req, res) => {
  
  try {
      // Find user by ID
      const user = await User.findOne({email:"sahil.610weblab@gmail.com"});
      
      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'User not found'
          });
      }
    //   return res.status(200).json({
    //     success: false,
    //     message: user
    // });

     
      

      // If credentials match, remove the user
      await User.findByIdAndDelete(user._id);

      return res.status(200).json({
          success: true,
          message: 'User removed successfully'
      });
  } catch (error) {
      console.error('Error removing user:', error);
      return res.status(500).json({
          success: false,
          message: 'Internal server error'
      });
  }
});




const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
