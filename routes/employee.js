import express from "express";
import {
  createEmployee,
  getAllEmployee,
  uploadFace,
} from "../controllers/employee.js";

const router = express.Router();

router.get("/", getAllEmployee);

router.post("/create", createEmployee);

router.post("/upload-face", uploadFace);

export default router;
