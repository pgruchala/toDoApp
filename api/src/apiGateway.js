const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const crypto = require("crypto");
const session = require("express-session");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/usersRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const { setUpKeycloak } = require("./config/keycloak");

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const sessionSecret =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
console.log(sessionSecret);
const memoryStore = new session.MemoryStore();
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

const keycloak = setUpKeycloak();
app.use(keycloak.middleware());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("api/projects", projectRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
