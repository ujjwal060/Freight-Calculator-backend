import mongoose from 'mongoose';

const connectToDatabase = async (dbUri) => {
  try {    
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.log('Connection unsuccessfull');
    process.exit(1);
  }
};

export default connectToDatabase;