import mongoose from "mongoose";

const DonateClothSchema = new mongoose.Schema(
  {
    // DONOR DETAILS
    donorName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    contactEmail: { type: String, required: true },

    // CLOTHING DETAILS
    clothType: { type: String, required: true },
    size: { type: String },
    fabricType: { type: String },
    category: { type: String },
    quantity: { type: Number, required: true },
    ageGroup: { type: String },
    gender: { type: String },
    condition: { type: String },
    season: { type: String },
    color: { type: String },
    extraDetails: { type: String },

    // DONATION MESSAGE / DESCRIPTION
    message: { type: String, required: true },

    // DELIVERY PREFERENCE
    deliveryPreference: {
      type: String,
      enum: ["pickup", "dropoff"],
      required: true,
    },

    // DONOR ADDRESS
    donorAddress: { type: String, required: true },
    landmark: { type: String },
    city: { type: String },
    state: { type: String },

    // AVAILABILITY DATE
    availableFrom: { type: Date, required: true },

    // MULTIPLE IMAGES
    images: {
      type: [String],
      default: [],
    },

    // USER RELATION
    userId: { type: String },

    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default
  mongoose.models.DonateCloth ||
  mongoose.model("DonateCloth", DonateClothSchema);
