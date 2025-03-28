import multer from "multer";

// ✅ Store image in memory (no local storage)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
