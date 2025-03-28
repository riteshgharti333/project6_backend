import cloudinary from "../utils/cloudinary.js";
import { Alumni } from "../models/alumniModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import streamifier from "streamifier";

//  Create Alumni
export const createAlumni = catchAsyncError(async (req, res, next) => {
  const { name, company } = req.body;

  if (!name || !company || !req.file) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  let imageUrl;

  try {
    // ✅ Upload image to Cloudinary using streamifier
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "collage_project/alumni_images",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    imageUrl = result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new ErrorHandler("Failed to upload image to Cloudinary", 500);
  }

  const alumni = await Alumni.create({
    name,
    company,
    image: imageUrl,
  });

  res.status(201).json({
    result: 1,
    message: "Alumni member created successfully",
    alumni,
  });
});

// Get Alumni List

export const getAlumni = catchAsyncError(async (req, res, next) => {
  const alumni = await Alumni.find().sort({ createdAt: -1 });

  res.status(200).json({
    result: 1,
    alumni,
  });
});

// Get Single Alumni by ID
export const getSingleAlumni = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const alumni = await Alumni.findById(id);

  if (!alumni) {
    throw new ErrorHandler("Alumni not found", 404);
  }

  res.status(200).json({
    result: 1,
    alumni,
  });
});

// Update Alumni
export const updateAlumni = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, company } = req.body;

  const alumni = await Alumni.findById(id);
  if (!alumni) {
    throw new ErrorHandler("Alumni not found", 404);
  }

  let imageUrl = alumni.image;

  if (req.file) {
    const publicId = alumni.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(
      `collage_project/alumni_images/${publicId}`
    );

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "collage_project/alumni_images",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    imageUrl = result.secure_url;
  }

  alumni.name = name || alumni.name;
  alumni.company = company || alumni.company;
  alumni.image = imageUrl;

  await alumni.save();

  res.status(200).json({
    result: 1,
    message: "Alumni updated successfully",
    alumni,
  });
});

// Delete Alumni
export const deleteAlumni = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const alumni = await Alumni.findById(id);
  if (!alumni) {
    throw new ErrorHandler("Alumni not found", 404);
  }

  // Delete image from Cloudinary
  const publicId = alumni.image.split("/").pop().split(".")[0];
  await cloudinary.uploader.destroy(
    `collage_project/alumni_images/${publicId}`
  );

  await Alumni.findByIdAndDelete(id);

  res.status(200).json({
    result: 1,
    message: "Alumni deleted successfully",
  });
});
