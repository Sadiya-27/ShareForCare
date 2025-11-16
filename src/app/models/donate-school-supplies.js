import mongoose from "mongoose";

const DonateSchoolSupplySchema = new mongoose.Schema(
  {
    // Donor Details
    donorName: {
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

    // Delivery Method
    deliveryMethod: {
      type: String,
      enum: ["drop-off", "pickup-request"],
      required: true,
    },

    // Pickup Address (only if pickup-request)
    address: {
      type: String,
      default: "",
    },
    landmark: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },

    // Dates
    availableFrom: {
      type: Date,
      required: true,
    },

    // Images
    images: {
      type: [String],
      default: [],
    },

    // Firebase user
    userId: {
      type: String,
      default: null,
    },

    completed: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

export default mongoose.models.DonateSchoolSupply ||
  mongoose.model("DonateSchoolSupply", DonateSchoolSupplySchema);
