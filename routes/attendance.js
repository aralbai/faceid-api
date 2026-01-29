import express from "express";
import {
  createAttendance,
  getAttendances,
  getLastFaceAttendance,
} from "../controllers/attendance.js";

const router = express.Router();

router.get("/", getAttendances);

router.get("/last", getLastFaceAttendance);

router.post("/", createAttendance);

export default router;
