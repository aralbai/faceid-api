import express from "express";
import multer from "multer";
import { faceEventHandler } from "../controllers/event.js";

const router = express.Router();
const upload = multer();

router.post("/event", upload.any(), faceEventHandler);

export default router;
