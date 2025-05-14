const axios = require("axios");
const qs = require("querystring");
require("dotenv").config();

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;
const KEYCLOAK_AUTH_SERVER_URL = process.env.KEYCLOAK_AUTH_SERVER_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const keycloakRegistration = await axios.post(
      `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      qs.stringify({
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const accessToken = keycloakRegistration.data.access_token;
    console.log("Succesfully obtained admin token");
    console.log("creating user in keycloak");
    await axios.post(
      `${KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
      {
        username: email,
        email: email,
        enabled: true,
        emailVerified: true,
        firstName,
        lastName,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("user created in keycloak");
    const userSearch = await axios.get(
      `${KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=${encodeURIComponent(
        email
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const keycloakId = userSearch.data[0].id;
    console.log(`Found user with ID: ${keycloakId}`);
    const userResponse = await axios.post(`${USERS_SERVICE_URL}/api/users`, {
      keycloakId,
      email,
      firstName,
      lastName,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse.data,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.response?.status === 409) {
      return res.status(409).json({ message: "User already exists" });
    } else if (error.response?.status === 403) {
      return res.status(403).json({
        message:
          "Forbidden: Insufficient permissions to create users in Keycloak",
        details: "Check your client credentials and permissions in Keycloak",
      });
    } else if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        message: "Registration failed",
        details: error.response.data,
      });
    }

    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const tokenResponse = await axios.post(
      `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      qs.stringify({
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        grant_type: "password",
        username: email,
        password: password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    res.status(200).json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    });
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }

    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    console.log(refreshToken);

    await axios.post(
      `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`,
      qs.stringify({
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    console.log(userInfo)
    const userResponse = await axios.get(`${USERS_SERVICE_URL}/api/users/me`, {
      headers: {
        "x-user-id": userInfo.sub,
        "x-user-email": userInfo.email,
        "x-user-role": userInfo.realm_access?.roles?.includes("admin")
          ? "admin"
          : "user",
      },
    });

    res.status(200).json(userResponse.data);
  } catch (error) {
    console.error("Get profile error:", error.response?.data || error.message);
    next(error);
  }
};
