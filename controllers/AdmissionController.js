import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Admission } from "../models/admissionModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import nodemailer from "nodemailer";

// NEW ADMISSION

export const createAdmission = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    phoneNumber,
    profile,
    selectCourse,
    selectState,
    district,
    city,
    message,
  } = req.body;

  if (
    !name ||
    !email ||
    !phoneNumber ||
    !profile ||
    !selectCourse ||
    !selectState ||
    !district ||
    !city ||
    !message
  ) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  const admission = await Admission.create({
    name,
    email,
    phoneNumber,
    profile,
    selectCourse,
    selectState,
    district,
    city,
    message,
  });

  res.status(201).json({
    result: 1,
    message: "Admission form created successfully",
    admission,
  });
});

// GET ALL ADMISSIONS
export const getAllAdmissions = catchAsyncError(async (req, res, next) => {
  const admissions = await Admission.find();

  if (!admissions || admissions.length === 0) {
    return next(new ErrorHandler("No admissions form found", 404));
  }

  res.status(200).json({
    result: 1,
    message: "Admissions form fetched successfully",
    count: admissions.length,
    admissions,
  });
});

// GET SINGLE ADMISSION BY ID

export const getAdmissionById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const admission = await Admission.findById(id);

  if (!admission) {
    return next(new ErrorHandler("Admission form not found", 404));
  }

  res.status(200).json({
    result: 1,
    message: "Admission form fetched successfully",
    admission,
  });
});

// DELETE ADMISSION BY ID

export const deleteAdmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const admission = await Admission.findById(id);

  if (!admission) {
    return next(new ErrorHandler("Admission form not found", 404));
  }

  await admission.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Admission form deleted successfully",
  });
});

// ADDMISSION APPROVED

export const approveAdmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const admission = await Admission.findById(id);

  if (!admission) {
    throw new ErrorHandler("Admission form not found", 404);
  }

  if (admission.approved) {
    return res.status(400).json({
      result: 0,
      message: "Admission is already approved.",
    });
  }

  // ✅ Mark as approved
  admission.approved = true;
  await admission.save();

  // ✅ Send confirmation email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: admission.email,
    subject: "Admission Approved",
    html: `
      <h2>Admission Approved</h2>
      <p>Dear ${admission.name},</p>
      <p>Congratulations! Your admission form has been approved.</p>
      <p>Course: <strong>${admission.selectCourse}</strong></p>
      <p>State: <strong>${admission.selectState}</strong></p>
      <p>District: <strong>${admission.district}</strong></p>
      <p>City: <strong>${admission.city}</strong></p>
      <br/>
      <p>We will contact you soon with further details.</p>
      <br/>
      <p>Best regards,</p>
      <p>International Academy Of Design</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      result: 1,
      message: "Admission approved and email sent successfully",
      admission,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ErrorHandler("Failed to send email", 500);
  }
});
