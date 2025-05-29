const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const projectRoutes = require("./routes/projectRoutes");
const errorHandler = require("./middleware/errorHandler");

const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/projects", projectRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    keycloak: "connected",
  });
});

app.use(errorHandler);

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

async function main() {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Project service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
main();
