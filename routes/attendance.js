import express from "express";
import { createAttendance, getAttendances } from "../controllers/attendance.js";

const router = express.Router();

router.get("/", getAttendances);

router.post("/", createAttendance);

export default router;
