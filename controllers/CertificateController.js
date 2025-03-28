import { generateCertificate } from "../utils/generateCertificate.js"; 
import path from "path";
import fs from "fs";

// ✅ Generate Certificate by Enrollment ID
export const getCertificate = async (req, res) => {
  const { enrollmentId } = req.params;

  try {
    // ✅ Generate the certificate
    const certificatePath = await generateCertificate(enrollmentId);

    // ✅ Serve the certificate image
    if (fs.existsSync(certificatePath)) {
      res.sendFile(path.resolve(certificatePath));
    } else {
      res.status(404).json({
        result: 0,
        message: "Certificate not found",
      });
    }
  } catch (error) {
    console.error("Error in certificate generation:", error);
    res.status(500).json({
      result: 0,
      message: "Failed to generate certificate",
    });
  }
};
