import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    // NGO DETAILS
    ngoName: { type: String, required: true },
    contactPerson: { type: String, required: true },
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

    // DESCRIPTION / REASON
    reason: { type: String, required: true },

    // DELIVERY
    deliveryPreference: {
      type: String,
      enum: ["pickup", "ngo-pickup"],
      required: true,
    },

    // ADDRESS
    ngoAddress: { type: String, required: true },
    landmark: { type: String },
    city: { type: String },
    state: { type: String },

    // DATE
    requiredBefore: { type: Date, required: true },

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

export default mongoose.models.Request || mongoose.model("Request-cloths", RequestSchema);
