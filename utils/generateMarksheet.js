import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Marksheet from "../models/marksheetModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Get current module path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use absolute path that works in both environments
const fontPath = path.join(__dirname, '../marksheetFonts/fonts/fonnts.com-garet-heavy.otf');

// Verify font exists before registering
if (!fs.existsSync(fontPath)) {
  throw new Error(`Font file not found at: ${fontPath}`);
}

// Register font with explicit properties
registerFont(fontPath, {
  family: "Garet-Heavy",
  weight: "bold",
  style: "normal",
});

export const printMarksheet = async (id) => {
  try {
    const marksheet = await Marksheet.findById(id).populate("student");

    if (!marksheet) {
      throw new ErrorHandler(`No marksheet found with this ID: ${id}`, 404);
    }

    // Load base image using correct path
    const templatePath = path.join(__dirname, '../templates/marksheet.jpg');
    const outputPath = path.join(__dirname, `../certificates/${id}.jpeg`);

    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw base image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Set font style
    ctx.fillStyle = "#000";
    ctx.font = "bold 22px 'Garet-Heavy'";
    ctx.textBaseline = "top";

    // Verify font is actually being used
    if (ctx.font.indexOf('Garet-Heavy') === -1) {
      console.warn('Warning: Garet-Heavy font not applied, using fallback');
    }

    // Rest of your drawing code...
    ctx.fillText(`${marksheet.student.name}`, 250, 337);
    ctx.fillText(`${marksheet.student.fatherName}`, 234, 373);
    ctx.fillText(`${marksheet.student.course}`, 318, 408);

    ctx.fillText(`${marksheet.student.duration}`, 648, 333);
    ctx.fillText(`${marksheet.student.enrollmentId}`, 758, 368);
    ctx.fillText(`${marksheet.student.certificateNo}`, 758, 405);

    marksheet.subjects.forEach((item, index) => {
      const baseY = 620;
      const lineHeight = 40;
      const y = baseY + index * lineHeight;

      ctx.fillText(item.courseCode, 100, y);
      ctx.fillText(item.courseName, 350, y);
      ctx.fillText(String(item.maxMarks), 680, y);
      ctx.fillText(String(item.obtainedMarks), 783, y);
      ctx.fillText(item.grade, 893, y);
    });

    ctx.fillText(`${marksheet.totalMaxMarks}`, 385, 1048);
    ctx.fillText(`${marksheet.totalObtainedMarks}`, 388, 1113);
    ctx.fillText(`${marksheet.overallGrade}`, 844, 1080);

    const buffer = canvas.toBuffer("image/png");

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  } catch (error) {
    console.error("Error generating marksheet:", error);
    throw error;
  }
};