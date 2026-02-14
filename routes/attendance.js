import express from "express";
import {
  createAttendance,
  deleteAttendance,
  getAttendances,
  getAttendancesByActiveJurnal,
  getAttendancesByJurnalId,
  getLastFaceAttendance,
} from "../controllers/attendance.js";

const router = express.Router();

router.get("/", getAttendances);

router.get("/active-jurnal", getAttendancesByActiveJurnal);

router.get("/getByJurnalId/:jurnalId", getAttendancesByJurnalId);

router.get("/last", getLastFaceAttendance);

router.post("/", createAttendance);

router.delete("/:attendanceId", deleteAttendance);

export default router;
