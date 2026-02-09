import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import AttendanceRouter from "./routes/attendance.js";
import JurnalRouter from "./routes/jurnal.js";
import EmployeeRouter from "./routes/employee.js";
import FaceEventRouter from "./routes/event.js";
import BolimRouter from "./routes/bolim.js";
import ActiveJurnalRouter from "./routes/activeJurnal.js";

import cors from "cors";


dotenv.config();

const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 Frontend ulandi:", socket.id);
});

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
// app.use(multer().any());

mongoose
  .connect("mongodb://127.0.0.1:27017/faceid")
  .then(() => console.log("Mongodb connected..."))
  .catch((err) => console.log(err));

app.use("/face", FaceEventRouter);
app.use("/jurnal", JurnalRouter);
app.use("/attendance", AttendanceRouter);
app.use("/employee", EmployeeRouter);
app.use("/bolim", BolimRouter);
app.use("/active-jurnal", ActiveJurnalRouter);

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}...`);
});
