import mongoose from "mongoose";
import User from "../models/User.js";

function buildFallbackUserName(user) {
  const base =
    String(user.email || "")
      .trim()
      .toLowerCase()
      .split("@")[0]
      .replace(/[^a-z0-9-_]+/g, "-") ||
    `legacy-user-${String(user._id).slice(-6).toLowerCase()}`;

  return base.replace(/^-+|-+$/g, "") || `legacy-user-${String(user._id).slice(-6).toLowerCase()}`;
}

async function repairUserEmailIndex() {
  const usersMissingUserName = await User.find({
    $or: [{ userName: null }, { userName: "" }, { userName: { $exists: false } }]
  })
    .select("_id email")
    .lean();

  for (const user of usersMissingUserName) {
    let nextUserName = buildFallbackUserName(user);
    let suffix = 1;

    while (await User.exists({ userName: nextUserName, _id: { $ne: user._id } })) {
      nextUserName = `${buildFallbackUserName(user)}-${suffix}`;
      suffix += 1;
    }

    await User.updateOne({ _id: user._id }, { $set: { userName: nextUserName } });
  }

  await User.updateMany(
    {
      $or: [{ email: null }, { email: "" }]
    },
    {
      $unset: { email: 1 }
    }
  );

  const indexes = await User.collection.indexes();
  const legacyEmailIndex = indexes.find((index) => index.name === "email_1");
  const legacyUserNameIndex = indexes.find((index) => index.name === "userName_1");

  if (legacyEmailIndex) {
    await User.collection.dropIndex("email_1").catch(() => {});
  }

  if (legacyUserNameIndex) {
    await User.collection.dropIndex("userName_1").catch(() => {});
  }

  await User.syncIndexes();
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URL;

  if (!uri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing MongoDB connection string. Set MONGODB_URI in your production environment.");
    }

    await mongoose.connect("mongodb://localhost:27017/medmaxpub");
    await repairUserEmailIndex();
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return;
  }

  await mongoose.connect(uri);
  await repairUserEmailIndex();
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
