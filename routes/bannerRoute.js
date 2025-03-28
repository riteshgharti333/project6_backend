import express from "express";
import {
  getBanner,
  updateBanner,
  createBanner,
  getAllBanners,
} from "../controllers/BannerController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Create a new banner
router.post("/", upload.single("image"), createBanner);

// Get a banner by type and ID
router.get("/:bannerType/:id", getBanner);

// Update a banner by type and ID
router.put("/:bannerType/:id", upload.single("image"), updateBanner);

router.get("/all-banners", getAllBanners);

export default router;
