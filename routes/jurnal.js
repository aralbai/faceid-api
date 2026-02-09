import express from "express";
import { createJurnal, deleteJurnal, getJurnal, getJurnals, getValidJurnals, updateJurnal } from "../controllers/jurnal.js";

const router = express.Router();

router.get("/", getJurnals);

router.get("/valid", getValidJurnals);

router.get("/:id", getJurnal);

router.post("/", createJurnal);

router.delete("/:id", deleteJurnal);

router.patch("/:id", updateJurnal);

export default router;
