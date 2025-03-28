import express from "express";
import multer from "multer";
import {
  createAlumni,
  getAlumni,
  getSingleAlumni,
  updateAlumni,
  deleteAlumni,
} from "../controllers/AlumniController.js";

const router = express.Router();
import upload from "../middlewares/multer.js";

router.post("/new-alumni", upload.single("image"), createAlumni);

router.get("/all-alumnies", getAlumni);

router.get("/:id", getSingleAlumni);

router.put("/:id", upload.single("image"), updateAlumni);

router.delete("/:id", deleteAlumni);

export default router;
