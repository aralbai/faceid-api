import express from "express";  
import { getActiveJurnal, updateActiveJurnal } from "../controllers/activeJurnal.js";

const router = express.Router();

router.get("/", getActiveJurnal);

router.put("/", updateActiveJurnal);


export default router;