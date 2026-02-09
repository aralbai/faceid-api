import express from "express";
import {
  createAttendance,
  getAttendances,
  getAttendancesByActiveJurnal,
  getLastFaceAttendance,
} from "../controllers/attendance.js";

const router = express.Router();

router.get("/", getAttendances);

router.get("/active-jurnal", getAttendancesByActiveJurnal);

router.get("/last", getLastFaceAttendance);

router.post("/", createAttendance);

export default router;
