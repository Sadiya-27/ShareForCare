import mongoose from "mongoose";

const FootwearRequestSchema = new mongoose.Schema(
  {
    ngoName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactNumber: { type: String, required: true },
    contactEmail: { type: String, required: true },

    // Footwear-specific fields
    shoeType: { type: String, required: true }, // e.g., shoes, sandals, slippers, boots
    size: { type: String, required: true },      // e.g., 5, 6, 7, kids sizes
    material: { type: String },                  // leather, rubber, canvas
    category: { type: String },                  // sports, school, casual
    quantity: { type: Number, required: true },
    gender: { type: String },                    // male, female, unisex
    condition: { type: String },                 // new, like-new, gently-used
    season: { type: String },                    // rainy, winter, summer
    purpose: { type: String },                   // school use, daily use
    color: { type: String },
    reason: { type: String, required: true },

    // Delivery
    deliveryPreference: {
      type: String,
      enum: ["pickup", "ngo-pickup"],
      required: true,
    },

    // Address
    ngoAddress: { type: String, required: true },
    landmark: { type: String },
    city: { type: String },
    state: { type: String },

    requiredBefore: { type: Date, required: true },
    urgency: {
      type: String,
      enum: ["normal", "urgent", "very-urgent"],
      default: "normal",
    },

    images: { type: [String], default: [] },

    userId: { type: String },

    completed: { type: Boolean, default: false }


  },
  { timestamps: true }
);

export default mongoose.models.FootwearRequest ||
  mongoose.model("FootwearRequest", FootwearRequestSchema);
