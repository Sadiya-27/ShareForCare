import mongoose from "mongoose";

const DonateFootwearSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    contactEmail: { type: String, required: true },

    // Footwear details
    shoeType: { type: String, required: true },     // shoes, sandals, slippers, boots
    size: { type: String, required: true },          // 5, 6, 7, kids sizes etc.
    material: { type: String },                      // leather, rubber, canvas
    category: { type: String },                      // sports, school, casual
    quantity: { type: Number, required: true },
    gender: { type: String },                        // male, female, unisex
    condition: { type: String, required: true },     // new, like-new, gently-used
    season: { type: String },                        // rainy, winter, summer
    color: { type: String },

    purpose: { type: String },                       // if donor specifies

    description: { type: String, required: true },   // details about the donation

    // Delivery
    deliveryMethod: {
      type: String,
      enum: ["drop-off", "pickup-request"],
      required: true,
    },

    // Address (if pickup request)
    address: { type: String },
    landmark: { type: String },
    city: { type: String },
    state: { type: String },

    availableFrom: { type: Date, required: true },

    images: { type: [String], default: [] },

    userId: { type: String },

    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.DonateFootwear ||
  mongoose.model("DonateFootwear", DonateFootwearSchema);
