const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const measurementRoutes = require("./routes/measurements");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/measurements", measurementRoutes);
app.get("/api/health", (req, res) => {
  res.json({ message: "TensioTrack API is running", status: "OK" });
});

// Ne démarrer le serveur qu'en développement local
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Exporter l'app pour Vercel
module.exports = app;
