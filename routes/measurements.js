const express = require("express");
const { body, validationResult } = require("express-validator");
const Measurement = require("../models/Measurement");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const measurements = await Measurement.find({ userId: req.user._id })
      .sort({ measurementDate: -1, measurementTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Measurement.countDocuments({ userId: req.user._id });

    res.json({
      measurements,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get measurements error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/range", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    const measurements = await Measurement.find({
      userId: req.user._id,
      measurementDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ measurementDate: 1, measurementTime: 1 });

    res.json({ measurements });
  } catch (error) {
    console.error("Get measurements range error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/",
  [
    auth,
    body("systolic").isInt({ min: 50, max: 300 }),
    body("diastolic").isInt({ min: 30, max: 200 }),
    body("pulse").isInt({ min: 30, max: 220 }),
    body("measurementDate").isDate(),
    body("measurementTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        systolic,
        diastolic,
        pulse,
        measurementDate,
        measurementTime,
        notes,
      } = req.body;

      const measurement = new Measurement({
        userId: req.user._id,
        systolic,
        diastolic,
        pulse,
        measurementDate: new Date(measurementDate),
        measurementTime,
        notes: notes || "",
      });

      await measurement.save();

      res.status(201).json({
        message: "Measurement created successfully",
        measurement,
      });
    } catch (error) {
      console.error("Create measurement error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/:id",
  [
    auth,
    body("systolic").optional().isInt({ min: 50, max: 300 }),
    body("diastolic").optional().isInt({ min: 30, max: 200 }),
    body("pulse").optional().isInt({ min: 30, max: 220 }),
    body("measurementDate").optional().isDate(),
    body("measurementTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const measurement = await Measurement.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!measurement) {
        return res.status(404).json({ message: "Measurement not found" });
      }

      const {
        systolic,
        diastolic,
        pulse,
        measurementDate,
        measurementTime,
        notes,
      } = req.body;

      if (systolic !== undefined) measurement.systolic = systolic;
      if (diastolic !== undefined) measurement.diastolic = diastolic;
      if (pulse !== undefined) measurement.pulse = pulse;
      if (measurementDate !== undefined)
        measurement.measurementDate = new Date(measurementDate);
      if (measurementTime !== undefined)
        measurement.measurementTime = measurementTime;
      if (notes !== undefined) measurement.notes = notes;

      await measurement.save();

      res.json({
        message: "Measurement updated successfully",
        measurement,
      });
    } catch (error) {
      console.error("Update measurement error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete("/:id", auth, async (req, res) => {
  try {
    const measurement = await Measurement.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    res.json({ message: "Measurement deleted successfully" });
  } catch (error) {
    console.error("Delete measurement error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
