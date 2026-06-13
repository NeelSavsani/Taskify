require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("Todo API Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});