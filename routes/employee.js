import express from "express";
import {
  deleteAllEmployeesFromTerminal,
  getAllEmployee,
  getAllEmployeesFromTerminal,
  getEmployee,
  getEmployeeByBolimId,
  getTerminalEmployeeTotal,
  getTerminalFaceTotal,
  syncAllEmployeesToTerminal,
  syncAllFacesToTerminal,
} from "../controllers/employee.js";

const router = express.Router();

router.get("/", getAllEmployee);

router.get("/:id", getEmployee);

router.get("/bolim/:bolimId", getEmployeeByBolimId);

router.post("/get-terminal-employees", getAllEmployeesFromTerminal);

router.post("/get-terminal-total", getTerminalEmployeeTotal);

router.post("/get-terminal-face-total", getTerminalFaceTotal);

router.post("/syncall", syncAllEmployeesToTerminal);

router.post("/syncFacesToTerminal", syncAllFacesToTerminal);

router.delete("/deleteallfromterminal", deleteAllEmployeesFromTerminal);

export default router;
