import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import Student from "../models/studentModel.js";
import ErrorHandler from "../utils/errorHandler.js";

const fontPath = path.resolve("fonts", "static", "DMSans_18pt-LightItalic.ttf");

registerFont(fontPath, { family: "DMSans", weight: "300", style: "italic" });

export const generateCertificate = async (enrollmentId) => {
  try {
    const student = await Student.findOne({ enrollmentId });

    if (!student) {
      throw new ErrorHandler(
        `No student found with enrollment ID: ${enrollmentId}`,
        404,
      );
    }

    // ✅ Load base certificate image
    const templatePath = path.join("templates", "template.jpeg");
    const outputPath = path.join(
      "certificates",
      `${student.enrollmentId}.jpeg`,
    );

    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // ✅ Draw the base image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // ✅ Format date to DD/MM/YYYY
    const date = new Date(student.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    ctx.fillStyle = "#000";
    ctx.font = "italic 22px DMSans";

    // ✅ Function to add letter spacing
    const drawTextWithSpacing = (text, x, y, spacing) => {
      let currentX = x;
      for (const char of text) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing; // Add spacing between characters
      }
    };

    // ✅ Draw text with letter spacing
    drawTextWithSpacing(`${student.enrollmentId}`, 1000, 210, 6); // 5px letter spacing
    drawTextWithSpacing(`${student.name}`, 580, 450, 6); // 4px letter spacing
    drawTextWithSpacing(`${student.course}`, 490, 540, 6);
    drawTextWithSpacing(`${student.duration} Year`, 580, 635, 6);
    drawTextWithSpacing(formattedDate, 560, 710, 6);
    drawTextWithSpacing(`${student.certificateNo}`, 100, 210, 6);

    // ✅ Save the generated certificate
    const buffer = canvas.toBuffer("image/png");

    // ✅ Ensure the directory exists
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
