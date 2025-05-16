async function authMiddleware(req, res, next) {
  try {
    const userId = req.headers["x-user-id"];
    const email = req.headers["x-user-email"];
    const role = req.headers["x-user-role"];

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User ID missing" });
    }

    req.user = {
      userId,
      email,
      role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authMiddleware };
