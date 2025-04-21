import cloudinary from "../utils/cloudinary.js";
import Course from "../models/courseModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import streamifier from "streamifier";
import mongoose from "mongoose";

// CREATE COURSE
export const createCourse = catchAsyncError(async (req, res, next) => {
  const {
    bannerTitle,
    courseType,
    courseTitle,
    courseDescription,
    courseListTitle,
    courseListDesc,
    courseLists,
  } = req.body;

  // Check for required fields
  if (
    !bannerTitle ||
    !courseType ||
    !courseTitle ||
    !courseDescription ||
    !courseListTitle ||
    !courseListDesc ||
    !courseLists ||
    !req.file
  ) {
    throw new ErrorHandler("All fields including the image are required!", 400);
  }

  // Upload bannerImage to Cloudinary
  let bannerImageUrl;
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "thenad_data/course_banners",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    bannerImageUrl = result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new ErrorHandler("Failed to upload banner image", 500);
  }

  // Parse courseLists (array of objects) from string to JSON
  let parsedCourseLists;
  try {
    parsedCourseLists = JSON.parse(courseLists);
    if (!Array.isArray(parsedCourseLists)) {
      throw new Error("Parsed courseLists is not an array");
    }
  } catch (error) {
    throw new ErrorHandler(
      "Invalid format for courseLists. Must be a JSON array.",
      400
    );
  }

  // Create course in DB
  const course = await Course.create({
    bannerTitle,
    bannerImage: bannerImageUrl,
    courseType,
    courseTitle,
    courseDescription,
    courseListTitle,
    courseListDesc,
    courseLists: parsedCourseLists,
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    course,
  });
});

// GET ALL COURSES
export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    courses,
  });
});

// GET SINGLE COURSE
export const getCourseById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    throw new ErrorHandler("Course ID is required", 400);
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new ErrorHandler("Course not found", 404);
  }

  res.status(200).json({
    success: true,
    course,
  });
});

// DELETE COURSE
export const deleteCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid ID format!", 400);
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new ErrorHandler("Course not found!", 404);
  }

  const imageUrl = course.bannerImage;
  if (imageUrl) {
    const publicId = imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`thenad_data/course_banners/${publicId}`);
  }

  await course.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Course deleted successfully!",
  });
});

// UPDATE COURSE
export const updateCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    bannerTitle,
    courseType,
    courseTitle,
    courseDescription,
    courseListTitle,
    courseListDesc,
    courseLists,
  } = req.body;

  const course = await Course.findById(id);

  if (!course) {
    throw new ErrorHandler("Course not found!", 404);
  }

  let bannerImageUrl = course.bannerImage;

  if (req.file) {
    try {
      // 🔥 Destroy old image from Cloudinary
      const oldImagePublicId = course.bannerImage
        .split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(
        `thenad_data/course_banners/${oldImagePublicId}`
      );

      // 🔥 Upload new image using streamifier
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "thenad_data/course_banners",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      bannerImageUrl = result.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new ErrorHandler("Failed to upload image to Cloudinary", 500);
    }
  }

  // ✅ Update course fields
  course.bannerTitle = bannerTitle || course.bannerTitle;
  course.bannerImage = bannerImageUrl;
  course.courseType = courseType || course.courseType;
  course.courseTitle = courseTitle || course.courseTitle;
  course.courseDescription = courseDescription || course.courseDescription;
  course.courseListTitle = courseListTitle || course.courseListTitle;
  course.courseListDesc = courseListDesc || course.courseListDesc;
  course.courseLists = courseLists || course.courseLists;

  await course.save();

  res.status(200).json({
    result: 1,
    message: "Course updated successfully",
    course,
  });
});
