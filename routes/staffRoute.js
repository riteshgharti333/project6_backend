import express from "express";
import {
  createStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/StaffController.js";

import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/new-staff", upload.single("image"), createStaff);

router.put("/:id", upload.single("image"), updateStaff);

router.get("/all-staffs", getAllStaff);

router.get("/:id", getSingleStaff);

router.delete("/:id", deleteStaff);

export default router;
