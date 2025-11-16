import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema({
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
  phoneNo: { type: Number, required: true },
  location: { type: String, required: true },
  address: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  skills: [{ type: String }],
  availability: { type: String }, // e.g., "Weekends", "Full-time", etc.
  experience: { type: String }, // e.g., "2 years volunteering at XYZ"
  motivation: { type: String }, // reason or personal statement
  joinedNGOs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ngo" }],
  verificationDoc: { type: String },
  verification: {type: String, default: 'not verified'},
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in Next.js serverless environments
export default mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema);
