import express from "express";
import {
  deleteAllEmployeesFromTerminal,
  getAllEmployee,
  getAllEmployeesFromTerminal,
  syncAllEmployeesToTerminal,
  syncFacesToTerminal,
  testSingleFace,
} from "../controllers/employee.js";

const router = express.Router();

router.get("/", getAllEmployee);

router.post("/getallfromterminal", getAllEmployeesFromTerminal);

router.post("/syncall", syncAllEmployeesToTerminal);

router.post("/syncFacesToTerminal", syncFacesToTerminal);

router.post("/test", testSingleFace);

router.delete("/deleteallfromterminal", deleteAllEmployeesFromTerminal);

export default router;
