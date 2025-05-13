 import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import Marksheet from "../models/marksheetModel.js";
import ErrorHandler from "../utils/errorHandler.js";

const fontPath = path.resolve(
  "marksheetFonts",
  "fonts",
  "fonnts.com-garet-heavy.otf"
);

registerFont(fontPath, {
  family: "Garet-Heavy",
  weight: "300",
  style: "normal",
});

export const printMarksheet = async (id) => {
  try {
    const marksheet = await Marksheet.findById(id).populate("student");

    if (!marksheet) {
      throw new ErrorHandler(`No marksheet found with this ID: ${id}`, 404);
    }

    // ✅ Load base certificate image
    const templatePath = path.join("templates", "marksheet.jpg");
    const outputPath = path.join("certificates", `${id}.jpeg`);

    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // ✅ Draw the base image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // ✅ Format date to DD/MM/YYYY
    const date = new Date(marksheet.date);
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    ctx.fillStyle = "#000";
    ctx.font = "22px 'Garet-Heavy'";

    // ✅ Function to add letter spacing
    const drawTextWithSpacing = (text, x, y, spacing) => {
      let currentX = x;
      for (const char of text) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing;
      }
    };

    ctx.fillText(`${marksheet.student.name}`, 250, 337);
    ctx.fillText(`${marksheet.student.fatherName}`, 234, 373);
    ctx.fillText(`${marksheet.student.course}`, 318, 408);

    //////////////////
    ctx.fillText(`${marksheet.student.duration}`, 648, 333);
    ctx.fillText(`${marksheet.student.enrollmentId}`, 758, 368);
    ctx.fillText(`${marksheet.student.certificateNo}`, 758, 405);

    marksheet.subjects.forEach((item, index) => {
      const baseY = 620;
      const lineHeight = 40;
      const y = baseY + index * lineHeight;

      drawTextWithSpacing(item.courseCode, 100, y, 4); // Adjust X for layout
      drawTextWithSpacing(item.courseName, 350, y, 4);
      drawTextWithSpacing(String(item.maxMarks), 680, y, 4);
      drawTextWithSpacing(String(item.obtainedMarks), 783, y, 4);
      drawTextWithSpacing(item.grade, 893, y, 4);
    });

    drawTextWithSpacing(`${marksheet.totalMaxMarks}`, 385, 1048, 6);
    drawTextWithSpacing(`${marksheet.totalObtainedMarks}`, 388, 1113, 6);
    drawTextWithSpacing(`${marksheet.overallGrade}`, 844, 1080, 6);

    const buffer = canvas.toBuffer("image/png");

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`Certificate saved at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};