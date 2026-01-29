import express from "express";
import { createEmployee, getAllEmployee } from "../controllers/employee.js";

const router = express.Router();

router.get("/", getAllEmployee);

router.post("/create", createEmployee);

export default router;
