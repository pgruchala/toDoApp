const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createUser = async (req, res, next) => {
  try {
    const { keycloakId, email, firstName, lastName } = req.body;

    if (!keycloakId || !email) {
      return res
        .status(400)
        .json({ message: "Keycloak ID and email are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { keycloakId },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await prisma.user.create({
      data: {
        keycloakId,
        email,
        firstName,
        lastName,
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, avatarUrl } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.id !== id && req.user.role !== "admin") {// użytkownik może zaktualizować tylko swój profil
      return res
        .status(403)
        .json({ message: "Forbidden - you can only update your own profile" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        avatarUrl,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const { keycloakId } = req.user;

    const user = await prisma.user.findUnique({
      where: { keycloakId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCurrentUser = async (req, res, next) => {
  try {
    const { keycloakId } = req.user;
    const { firstName, lastName, avatarUrl } = req.body;

    const user = await prisma.user.findUnique({
      where: { keycloakId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { keycloakId },
      data: {
        firstName,
        lastName,
        avatarUrl,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    next(error);
  }
};

// add todo (add todo id)??

// remove todo (remove todo id)̣??

// add project (project id)??
