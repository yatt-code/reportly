import mongoose from 'mongoose';

// Simple singleton pattern for database connection
let isConnected = false;

async function connectDB() {
  // Set strict query behavior for Mongoose 7+
  mongoose.set('strictQuery', true);

  if (isConnected) {
    console.log('=> using existing database connection');
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env.local');
  }

  try {
    console.log('=> using new database connection');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'reportly', // Specify your database name
      // useNewUrlParser: true, // Deprecated
      // useUnifiedTopology: true, // Deprecated
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Optionally re-throw or handle more gracefully
    throw new Error('Database connection failed');
  }
}

export default connectDB;