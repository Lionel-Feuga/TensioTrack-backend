const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    systolic: {
      type: Number,
      required: true,
      min: 50,
      max: 300,
    },
    diastolic: {
      type: Number,
      required: true,
      min: 30,
      max: 200,
    },
    pulse: {
      type: Number,
      required: true,
      min: 30,
      max: 220,
    },
    measurementDate: {
      type: Date,
      required: true,
    },
    measurementTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

measurementSchema.index({ userId: 1, measurementDate: -1 });

module.exports = mongoose.model("Measurement", measurementSchema);
