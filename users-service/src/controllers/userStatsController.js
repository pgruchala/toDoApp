const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getUserStats = async (req, res, next) => {
  try {
    const { role } = req.user;

    if (!role.includes("admin")) {
      return res.status(403).json({
        success: false,
        message: "Access denied - admin privileges required",
      });
    }
    const totalUsers = await prisma.user.count();
    const stats = { totalUsers };
    res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
