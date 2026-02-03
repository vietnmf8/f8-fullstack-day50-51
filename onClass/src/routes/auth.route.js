const express = require("express");
const router = express.Router();
const authController = require("@/controllers/auth.controller");
const authRequiredMiddleware = require("@/middlewares/authRequired.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", authRequiredMiddleware, authController.getCurrentUser);

module.exports = router;
