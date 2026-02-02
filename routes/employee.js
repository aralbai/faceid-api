import express from "express";
import {
  deleteAllEmployeesFromTerminal,
  getAllEmployee,
  getAllEmployeesFromTerminal,
  syncAllEmployeesToTerminal,
} from "../controllers/employee.js";

const router = express.Router();

router.get("/", getAllEmployee);

router.post("/getallfromterminal", getAllEmployeesFromTerminal);

router.post("/syncall", syncAllEmployeesToTerminal);

router.post("/syncFacesToTerminal", syncAllEmployeesToTerminal);

router.delete("/deleteallfromterminal", deleteAllEmployeesFromTerminal);

export default router;
