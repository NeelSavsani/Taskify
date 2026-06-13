const Task = require("../models/Task");

// CREATE TASK
const createTask = async (req, res) => {
    try {
        const task = await Task.create({
            title: req.body.title,
            description: req.body.description,
            user: req.user.id
        });

        res.status(201).json(task);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET ALL TASKS
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user.id
        });

        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET SINGLE TASK
const getTaskById = async (req, res) => {
    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not Authorized"
            });
        }

        res.status(200).json(task);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// UPDATE TASK
const updateTask = async (req, res) => {
    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not Authorized"
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json(updatedTask);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// DELETE TASK
const deleteTask = async (req, res) => {
    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not Authorized"
            });
        }

        await task.deleteOne();

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};