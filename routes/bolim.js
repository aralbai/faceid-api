import express from "express";
import {
  getBolimById,
  getBolimCountInDateRange,
  getBolims,
} from "../controllers/bolim.js";

const router = express.Router();

router.get("/", getBolims);

router.get("/count", getBolimCountInDateRange);

router.get("/:bolimId", getBolimById);

export default router;
