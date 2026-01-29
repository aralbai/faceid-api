import express from "express";
import { createJurnal } from "../controllers/journal.js";

const router = express.Router();

router.post("/", createJurnal);

export default router;
