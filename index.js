import express from "express";
import multer from "multer";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Jurnal from "./model/Jurnal.js";
import Attendance from "./model/Attendance.js";
import AttendanceRouter from "./routes/attendance.js";
import JurnalRouter from "./routes/journal.js";
import EmployeeRouter from "./routes/employee.js";
import cors from "cors";
import Stream from "node-rtsp-stream";

const upload = multer();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const stream = new Stream({
  name: "cam1",
  streamUrl: "rtsp://admin:Abc112233@192.168.88.143:554/Streaming/Channels/101",
  wsPort: 9999,
  ffmpegOptions: {
    "-stats": "",
    "-r": 20,
    "-s": "640x360",
    "-q:v": "3",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Frontend ulandi:", socket.id);
});

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose
  .connect("mongodb://127.0.0.1:27017/faceid")
  .then(() => console.log("Mongodb connected..."))
  .catch((err) => console.log(err));

app.post("/face/event", upload.any(), async (req, res) => {
  res.status(200).send("OK");

  const raw = req.body.event_log;

  if (!raw) return res.status(200).send("NO EVENT");

  let event;
  try {
    event = JSON.parse(raw);
  } catch (e) {
    return res.status(200).send("PARSE ERROR");
  }

  if (
    event.eventType === "AccessControllerEvent" &&
    event.AccessControllerEvent.majorEventType === 5
  ) {
    if (event.AccessControllerEvent.subEventType === 75) {
      console.log("✅ EVENT:", event.AccessControllerEvent.name);

      const payload = {
        name: event.AccessControllerEvent.name,
        bolim: event.AccessControllerEvent.employeeNoString,
        date: event.dateTime,
      };

      console.log("📩 FACE EVENT KELDI", new Date().toISOString());

      const jurnal = await Jurnal.findById("6979b853e358ab5d3fb44cb1");

      if (jurnal) {
        const attendance = await Attendance.findOne({
          jurnalId: jurnal._id,
          name: payload.name,
        });

        if (attendance) return;

        const newAttendance = new Attendance({
          jurnalId: jurnal._id,
          name: payload.name,
          bolim: payload.bolim,
          date: payload.date,
        });

        await newAttendance.save();

        const attendances = await Attendance.find();

        io.emit("face-success", attendances);
      }
    }
  }
});

app.use("/jurnal", JurnalRouter);
app.use("/attendance", AttendanceRouter);
app.use("/employee", EmployeeRouter);

server.listen(5000, () => {
  console.log("🚀 Server + Socket.IO running on port 5000");
});
