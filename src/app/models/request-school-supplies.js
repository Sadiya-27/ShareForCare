import mongoose from "mongoose";

const SchoolSupplyRequestSchema = new mongoose.Schema(
  {
    ngoName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },

    // School Supply Details
    itemType: {
      type: String,
      required: true,
    },
    gradeLevel: {
      type: String,
      default: "",
    },
    brandPreference: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
    },
    itemCondition: {
      type: String,
      default: "",
    },

    extraDetails: {
      type: String,
      default: "",
    },

    reason: {
      type: String,
      required: true,
    },

    // Delivery Preference
    deliveryPreference: {
      type: String,
      enum: ["pickup", "ngo-pickup"],
      required: true,
    },

    // Address
    ngoAddress: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },

    // Dates
    requiredBefore: {
      type: Date,
      required: true,
    },
    urgency: {
      type: String,
      enum: ["normal", "urgent", "very-urgent"],
      default: "normal",
    },

    // Images
    images: {
      type: [String], // array of URLs
      default: [],
    },

    // Linked user ID (Firebase)
    userId: {
      type: String,
      default: null,
    },

    completed: { type: Boolean, default: false }

  },
  { timestamps: true }
);

export default mongoose.models.SchoolSupplyRequest ||
  mongoose.model("SchoolSupplyRequest", SchoolSupplyRequestSchema);
