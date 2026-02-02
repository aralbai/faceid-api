import express from "express";
import { createJurnal, getJurnal } from "../controllers/journal.js";

const router = express.Router();

router.get("/:id", getJurnal);

router.post("/", createJurnal);

export default router;
