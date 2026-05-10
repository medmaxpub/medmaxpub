import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URL;

  if (!uri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing MongoDB connection string. Set MONGODB_URI in your production environment.");
    }

    await mongoose.connect("mongodb://localhost:27017/medmaxpub");
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return;
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
