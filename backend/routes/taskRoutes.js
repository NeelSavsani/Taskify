const express = require("express");
const router = express.Router();

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

// Create Task
router.post("/", protect, createTask);

// Get All Tasks
router.get("/", protect, getTasks);

// Get Single Task
router.get("/:id", protect, getTaskById);

// Update Task
router.put("/:id", protect, updateTask);

// Delete Task
router.delete("/:id", protect, deleteTask);

module.exports = router;