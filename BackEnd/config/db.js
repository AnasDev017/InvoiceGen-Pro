import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.DATA_BASE_URL, {
      bufferCommands: false,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    throw new Error("DB connection failed");
  }
};

export default connectDB;
