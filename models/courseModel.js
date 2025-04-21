import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    bannerTitle: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
    courseType: {
      type: String,
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    courseDescription: {
      type: String,
      required: true,
    },
    courseListTitle: {
      type: String,
      required: true,
    },
    courseListDesc: {
      type: String,
      required: true,
    },
    courseLists: [
      {
        title: {
          type: String,
          required: true,
        },
        desc: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", courseSchema);
