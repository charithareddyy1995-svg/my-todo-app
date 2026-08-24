const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Todo Schema
const todoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const Todo = mongoose.model("Todo", todoSchema);

// Home
app.get("/", (req, res) => {
    res.send("My Todo App is running!");
});

// Get all todos
app.get("/api/todos", async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch todos" });
    }
});

// Add todo
app.post("/api/todos", async (req, res) => {
    try {
        const { task } = req.body;

        if (!task || task.trim() === "") {
            return res.status(400).json({ message: "Task is required" });
        }

        const todo = new Todo({
            task: task.trim()
        });

        const savedTodo = await todo.save();

        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(500).json({ message: "Failed to add todo" });
    }
});

// Complete / incomplete todo
app.put("/api/todos/:id", async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        todo.completed = !todo.completed;

        const updatedTodo = await todo.save();

        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: "Failed to update todo" });
    }
});

// Delete todo
app.delete("/api/todos/:id", async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);

        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json(deletedTodo);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete todo" });
    }
});

// Connect MongoDB and start server
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });