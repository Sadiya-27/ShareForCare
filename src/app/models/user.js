import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in serverless environments
export default mongoose.models.User || mongoose.model("User", UserSchema);
