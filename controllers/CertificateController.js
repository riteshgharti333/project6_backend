// /controllers/certificateController.js
import fs from "fs";
import path from "path";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import Student from "../models/studentModel.js";


export const getCertificate = catchAsyncError(async (req, res, next) => {
  const { enrollmentId } = req.params;
  const student = await Student.findOne({ enrollmentId });
  if (!student) {
    return next(new ErrorHandler("❌ Invalid enrollment ID. No record found.", 404));
  }

  const certificatePath = await generateCertificate(enrollmentId);

  if (!fs.existsSync(certificatePath)) {
    return next(new ErrorHandler("❌ Certificate file not found after generation.", 404));
  }

  return res.sendFile(path.resolve(certificatePath));
});
