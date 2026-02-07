import express from "express";
import {  getBolimById, getBolims } from "../controllers/bolim.js";

const router = express.Router();

router.get("/", getBolims);

router.get("/:bolimId", getBolimById);


export default router;