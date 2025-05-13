import fs from "fs";
import path from "path";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Student from "../models/studentModel.js";
import { generateSecondCertificate } from "../utils/generateSecondCertificate.js";


export const getSecondCertificate = catchAsyncError(async (req, res, next) => {
  const { enrollmentId } = req.params;
  const student = await Student.findOne({ enrollmentId });
  if (!student) {
    return next(new ErrorHandler("❌ Invalid enrollment ID. No record found.", 404));
  }

  const certificatePath = await generateSecondCertificate(enrollmentId);

  if (!fs.existsSync(certificatePath)) {
    return next(new ErrorHandler("❌ Certificate file not found after generation.", 404));
  }

  return res.sendFile(path.resolve(certificatePath));
});
