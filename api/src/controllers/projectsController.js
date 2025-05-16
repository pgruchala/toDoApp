const axios = require("axios");
require("dotenv").config();
const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL;

exports.createProject = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const projectData = req.body;
    const projectResponse = await axios.post(
      `${PROJECT_SERVICE_URL}/api/projects`,
      projectData,
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

    res.status(201).json(projectResponse.data);
  } catch (error) {
    next(error);
  }
};
exports.getAllProjects = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const queryParams = new URLSearchParams(req.query).toString();
    const queryString = queryParams ? `?${queryParams}` : "";
    const projectResponse = await axios.get(
      `${PROJECT_SERVICE_URL}/api/projects${queryString}`,
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
    res.status(200).json(projectResponse.data);
  } catch (error) {
    next(error);
  }
};
exports.getProjectById = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const { id } = req.params;
    const projectResponse = await axios.get(
      `${PROJECT_SERVICE_URL}/api/projects/${id}`,
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
    res.status(200).json(projectResponse.data);
  } catch (error) {
    next(error);
  }
};
exports.updateProject = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const { id } = req.params;
    const projectData = req.body;
    const projectResponse = await axios.patch(
      `${PROJECT_SERVICE_URL}/api/projects/${id}`,
      projectData,
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
    res.status(200).json(projectResponse.data);
  } catch (error) {
    next(error);
  }
};
exports.deleteProject = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    const { id } = req.params;
    const projectResponse = await axios.delete(
      `${PROJECT_SERVICE_URL}/api/projects/${id}`,
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
    res.status(204).json(projectResponse.data);
  } catch (error) {
    next(error);
  }
};