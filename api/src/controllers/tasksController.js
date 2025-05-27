const axios = require("axios");
require("dotenv").config();
const TASKS_SERVICE_URL = process.env.TASKS_SERVICE_URL;

exports.createTask = async (req, res, next) => {
  try {
    console.log("Creating task - User info:", req.user);
    console.log("Task data:", req.body);
    
    const taskResponse = await axios.post(
      `${TASKS_SERVICE_URL}/api/tasks`,
      req.body,
      {
        headers: {
          "x-user-id": req.user.userId,
          "x-user-email": req.user.email,
          "x-user-role": Array.isArray(req.user.role) ? req.user.role.join(',') : req.user.role,
          "Content-Type": "application/json"
        },
      }
    );
    
    console.log("Task created successfully");
    res.status(201).json(taskResponse.data);
  } catch (error) {
    console.error("Error creating task:", error.response?.data || error.message);
    next(error);
  }
};
exports.getAllTasks = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const queryParams = new URLSearchParams(req.query).toString();
    const queryString = queryParams ? `?${queryParams}` : "";
    const taskResponse = await axios.get(
      `${TASKS_SERVICE_URL}/api/tasks${queryString}`,
      {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": userInfo.realm_access?.roles?.includes("admin")
            ? "admin"
            : "user",
        },
      }
    );
    res.status(200).json(taskResponse.data);
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const { id } = req.params;
    const taskResponse = await axios.get(
      `${TASKS_SERVICE_URL}/api/tasks/${id}`,
      {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": userInfo.realm_access?.roles?.includes("admin")
            ? "admin"
            : "user",
        },
      }
    );
    res.status(200).json(taskResponse.data);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const { id } = req.params;
    const taskData = req.body;
    const taskResponse = await axios.patch(
      `${TASKS_SERVICE_URL}/api/tasks/${id}`,
      taskData,
      {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": userInfo.realm_access?.roles?.includes("admin")
            ? "admin"
            : "user",
        },
      }
    );
    res.status(200).json(taskResponse.data);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const { id } = req.params;
    const taskResponse = await axios.delete(
      `${TASKS_SERVICE_URL}/api/tasks/${id}`,
      {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": userInfo.realm_access?.roles?.includes("admin")
            ? "admin"
            : "user",
        },
      }
    );
    res.status(200).json(taskResponse.data);
  } catch (error) {
    next(error);
  }
};
