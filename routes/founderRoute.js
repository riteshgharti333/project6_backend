import express from "express";
import {
  createFounder,
  getAllFounders,
  getFounder,
  updateFounder,
  deleteFounder,
} from "../controllers/FounderController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/new-founder", upload.single("image"), createFounder);

router.put("/:id", upload.single("image"), updateFounder);

router.get("/all-founders", getAllFounders);

router.get("/:id", getFounder);

router.delete("/:id", deleteFounder);

export default router;
