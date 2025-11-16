import mongoose from "mongoose";

const NgoSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  profilePic: { type: String },
  ngoName: { type: String, required: true },
  ngoLocation: { type: String, required: true },
  latitude: { type: Number, required: true },
longitude: { type: Number, required: true },
  ngoAddress: { type: String, required: true },
  ngoPhoneNo:{type: Number, required: true},
  ngoWebsite: { type: String },
  ngoType: { type: String, required: true },
  ngoDescription: { type: String, required: true },
  verificationDoc: { type: String },
  verification: {type: String, default: 'not verified'},
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in Next.js serverless environments
export default mongoose.models.Ngo || mongoose.model("Ngo", NgoSchema);
