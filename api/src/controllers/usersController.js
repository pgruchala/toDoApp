const axios = require("axios");
const qs = require("qs");
require("dotenv").config();

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;
const KEYCLOAK_AUTH_SERVER_URL = process.env.KEYCLOAK_AUTH_SERVER_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userInfo = req.kauth.grant.access_token.content;

    const response = await axios.get(`${USERS_SERVICE_URL}/api/users/${id}`, {
      headers: {
        "x-user-id": userInfo.sub,
        "x-user-email": userInfo.email,
        "x-user-role": userInfo.realm_access?.roles?.includes("admin")
          ? "admin"
          : "user",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Get user error:", error.response?.data || error.message);

    if (error.response?.status) {
      return res.status(error.response.status).json(error.response.data);
    }

    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, avatarUrl } = req.body;
    const userInfo = req.kauth.grant.access_token.content;

    const response = await axios.patch(
      `${USERS_SERVICE_URL}/api/users/${id}`,
      { firstName, lastName, avatarUrl },
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

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Update user error:", error.response?.data || error.message);

    if (error.response?.status) {
      return res.status(error.response.status).json(error.response.data);
    }

    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;

    const response = await axios.get(`${USERS_SERVICE_URL}/api/users/me`, {
      headers: {
        "x-user-id": userInfo.sub,
        "x-user-email": userInfo.email,
        "x-user-role": userInfo.realm_access?.roles?.includes("admin")
          ? "admin"
          : "user",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Get current user error:",
      error.response?.data || error.message
    );

    if (error.response?.status) {
      return res.status(error.response.status).json(error.response.data);
    }

    next(error);
  }
};

exports.updateCurrentUser = async (req, res, next) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body;
    const userInfo = req.kauth.grant.access_token.content;

    const response = await axios.patch(
      `${USERS_SERVICE_URL}/api/users/me`,
      { firstName, lastName, avatarUrl },
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

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Update current user error:",
      error.response?.data || error.message
    );

    if (error.response?.status) {
      return res.status(error.response.status).json(error.response.data);
    }

    next(error);
  }
};

