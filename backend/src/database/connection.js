import mongoose from "mongoose";
import config from "../config/env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
