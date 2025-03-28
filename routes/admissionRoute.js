import express from "express";

import { approveAdmission, createAdmission, deleteAdmission, getAdmissionById, getAllAdmissions } from "../controllers/AdmissionController.js";

const router = express.Router();

router.post("/new-admission", createAdmission);
router.get("/all-admission", getAllAdmissions);
router.get("/:id", getAdmissionById);
router.delete("/:id", deleteAdmission);

router.put("/admission-approve/:id", approveAdmission);


export default router;
