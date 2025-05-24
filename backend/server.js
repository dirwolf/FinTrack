const app = require('./app');
const dotenv = require('dotenv');
const { connectDB } = require('./db/connectDB');

dotenv.config();

const PORT = 5001;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
