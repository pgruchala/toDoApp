const Project = require("../models/Project");

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;
    const { userId } = req.user;
    const newProject = new Project({
      name,
      description,
      userId,
      members,
    });
    const savedProject = await newProject.save();
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: savedProject,
    });
  } catch (error) {
    next(error);
  }
};
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, userId } = req.user;
    const project = await Project.findOne({
      _id: id,
      $or: [{ userId }, { members: email }],
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllProjects = async (req, res, next) => {
  try {
    const { email, userId } = req.user;
    const projects = await Project.find({
      $or: [{ userId }, { members: email }],
    });
    if (!projects) {
      return res.status(404).json({
        success: false,
        message: "No projects found",
      });
    }
    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, members, tasks } = req.body;
    const { userId } = req.user;
    const project = await Project.findOne({ 
      _id: id, 
      $or: [
        { userId },
        { members: email }
      ]
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    project.name = name || project.name;
    project.description = description || project.description;
    project.members = members || project.members;
    project.updatedAt = new Date();
    project.tasks = tasks || project.tasks;
    const updatedProject = await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const project = await Project.findOne({ _id: id, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    await Project.deleteOne({ _id: id });
    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
