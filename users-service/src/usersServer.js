const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { PrismaClient } = require("@prisma/client");
const { errorHandler } = require("./middleware/errorHandling");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use(errorHandler);

// const keycloakConfig = {
//   realm: process.env.KEYCLOAK_REALM,
//   "auth-server-url": ,
// };

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully");

    app.listen(PORT, () => {
      console.log(`Users service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
