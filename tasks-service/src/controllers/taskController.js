const { Query } = require("mongoose");
const Task = require("../models/Task");

exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
    } = req.body;
    const { userId } = req.user;
    const newTask = new Task({
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      dueDate,
      userId,
      projectId,
      assignedTo,
    });
    const savedTask = await newTask.save();
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: savedTask,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllTasks = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const {
      projectId,
      status,
      priority,
      search,
      page = 1,
      limit = 10,
    } = req.query;
    const query = { userId };
    if (projectId) {
      query.projectId = projectId;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit);

    res.status(200).json({
      tasks,
      totalTasks,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
    } = req.body;
    const { userId } = req.user;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    if (task.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this task",
      });
    }
    task.title = title || task.title;
    task.description =
      description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.projectId = projectId || task.projectId;
    task.assignedTo = assignedTo || task.assignedTo;
    task.updatedAt = new Date();

    const updatedTask = await task.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    if (task.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this task",
      });
    }
    await Task.deleteOne({ _id: id });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    if (task.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this task",
      });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};
