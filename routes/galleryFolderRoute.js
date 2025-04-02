import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs-extra";
import {
  createGalleryFolder,
  deleteGalleryFolder,
  getAllGalleryFolders,
  getSingleGalleryFolder,
  updateGalleryFolder,
} from "../controllers/GalleryFolderController.js";

// ✅ Ensure 'uploads' folder exists
const uploadDir = "uploads/gallery";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

const galleryUpload = upload.fields([
  { name: "folderImage", maxCount: 1 },
  { name: "galleryImages" }
]);

// ✅ Image Compression Middleware
const processImages = async (req, res, next) => {
  if (!req.files) return next();

  try {
    const compressImage = async (file) => {
      const outputPath = path.join(uploadDir, `${Date.now()}-compressed.webp`);

      await sharp(file.buffer)
        .toFormat("webp")                   // ✅ Convert to WebP
        .webp({ quality: 70 })              // ✅ Compress with 70% quality
        .toFile(outputPath);

      return outputPath;
    };

    // ✅ Compress folderImage
    if (req.files.folderImage) {
      const folderImage = req.files.folderImage[0];
      const compressedFolderImage = await compressImage(folderImage);
      req.files.folderImage[0].path = compressedFolderImage;
    }

    // ✅ Compress galleryImages
    if (req.files.galleryImages) {
      const compressedGalleryImages = await Promise.all(
        req.files.galleryImages.map((img) => compressImage(img))
      );

      req.files.galleryImages.forEach((img, index) => {
        img.path = compressedGalleryImages[index];
      });
    }

    next();
  } catch (error) {
    console.error("Image compression error:", error);
    res.status(500).json({ message: "Failed to process images" });
  }
};

const router = express.Router();

router.post(
  "/new-gallery-folder",
  galleryUpload,
  processImages,
  createGalleryFolder
);

router.put(
  "/:id",
  galleryUpload,
  processImages,
  updateGalleryFolder
);

router.get("/all-gallery-folders", getAllGalleryFolders);
router.get("/:id", getSingleGalleryFolder);
router.delete("/:id", deleteGalleryFolder);

export default router;
