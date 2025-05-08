async function authMiddleware(req, res, next) {
  try {
    // Token validation is handled by API Gateway with Keycloak
    const keycloakId = req.headers["x-user-id"];
    const email = req.headers["x-user-email"];
    const role = req.headers["x-user-role"];

    if (!keycloakId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User ID missing" });
    }

    req.user = {
      keycloakId,
      email,
      role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {authMiddleware};
