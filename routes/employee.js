import express from "express";
import {
  deleteAllEmployeesFromTerminal,
  getAllEmployee,
  getAllEmployeesFromTerminal,
  getEmployeeByBolimId,
  syncAllEmployeesToTerminal,
  syncAllFacesToTerminal,
} from "../controllers/employee.js";

const router = express.Router();

router.get("/", getAllEmployee);

router.get("/bolim/:bolimId", getEmployeeByBolimId);

router.post("/getallfromterminal", getAllEmployeesFromTerminal);

router.post("/syncall", syncAllEmployeesToTerminal);

router.post("/syncFacesToTerminal", syncAllFacesToTerminal);

router.delete("/deleteallfromterminal", deleteAllEmployeesFromTerminal);

export default router;
