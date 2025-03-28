import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import { errorMiddleware } from "./middlewares/error.js";
import authRouter from "./routes/authRoute.js";
import admissionRouter from "./routes/admissionRoute.js";
import enquiryRouter from "./routes/enquiryRoute.js";
import contactRouter from "./routes/contactRoute.js";

import galleryRouter from "./routes/galleryRoute.js";
import bannerRouter from "./routes/bannerRoute.js";

import staffRouter from "./routes/staffRoute.js";
import founderRouter from "./routes/founderRoute.js";

import imageRouter from "./routes/imageRoute.js";
import studentRouter from "./routes/studentRoute.js";
import certificateRouter from "./routes/certificateRoute.js";

import galleryFolderRouter from "./routes/galleryFolderRoute.js";
import alumniRouter from "./routes/alumniRoute.js";

// Initialize Express app
export const app = express();

app.use(helmet());
app.use(mongoSanitize());

// Load environment variables
config({
  path: "./data/config.env",
});

// Configure CORS settings
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
];

// Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new ErrorHandler("Not allowed by CORS", 403));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admission", admissionRouter);
app.use("/api/enquiry", enquiryRouter);
app.use("/api/contact", contactRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/staff", staffRouter);
app.use("/api/founder", founderRouter);
app.use("/api/upload", imageRouter);

app.use("/api/student", studentRouter);
app.use("/api/certificate", certificateRouter);
app.use("/api/gallery-folder", galleryFolderRouter);
app.use("/api/alumni", alumniRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Backend");
});

// Error Middleware
app.use(errorMiddleware);
