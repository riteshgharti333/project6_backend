import express from "express";

import {
  changePassword,
  // forgotPassword,
  login,
  logout,
  profile,
  register,
  // resetPassword,
} from "../controllers/AuthController.js";

import { isAuthenticated } from "../middlewares/auth.js";

// import { approveContact } from "../controllers/ContactController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.put("/change-password", isAuthenticated, changePassword);

router.get("/profile", isAuthenticated, profile);

// router.put("approve/:id", approveContact);

// router.post("/forgot-password", forgotPassword);

// router.post("/reset-password/:id/:sessionToken", resetPassword);

export default router;
