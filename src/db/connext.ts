import mongoose from "mongoose";

export const dbConnect = async () => {
  await mongoose.connect(String(process.env.MONGODB_URI));
  console.log("Connected to MongoDB....");
};
