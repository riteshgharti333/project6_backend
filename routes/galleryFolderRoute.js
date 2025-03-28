import express from "express";
import multer from "multer";
import {
  createGalleryFolder,
  deleteGalleryFolder,
  getAllGalleryFolders,
  getSingleGalleryFolder,
  updateGalleryFolder,
} from "../controllers/GalleryFolderController.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const galleryUpload = upload.fields([
  { name: "folderImage", maxCount: 1 },
  { name: "galleryImages" },
]);

const router = express.Router();

router.post("/new-gallery-folder", galleryUpload, createGalleryFolder);

router.put("/:id", galleryUpload, updateGalleryFolder);


router.get("/all-gallery-folders", getAllGalleryFolders);
router.get("/:id", getSingleGalleryFolder);
router.delete("/:id", deleteGalleryFolder);


export default router;
