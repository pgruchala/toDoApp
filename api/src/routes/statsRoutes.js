const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const { authenticateAndExtract } = require("../middleware/authMiddleware");

router.use(...authenticateAndExtract());

router.get("/service", statsController.getServiceStats);

router.get("/user", statsController.getUserStats);

module.exports = router;