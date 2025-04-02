import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// ✅ Ensure 'uploads' folder exists automatically
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Multer configuration (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Sharp middleware for image compression (without resizing)
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  const outputPath = path.join(uploadDir, `${Date.now()}-compressed.webp`);

  try {
    await sharp(req.file.buffer)
      .toFormat("webp") // ✅ Convert to WebP
      .webp({ quality: 70 }) // ✅ Compress image (70% quality)
      .toFile(outputPath);

    req.file.path = outputPath; // ✅ Store the compressed image path
    next();
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({ message: "Failed to process image" });
  }
};

export default {
  upload,
  processImage,
};
