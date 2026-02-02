import Jurnal from "../models/Jurnal.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

export const faceEventHandler = async (req, res) => {
  // ⚠️ Kamera tez qaytish kutadi
  res.status(200).send("OK");

  const raw = req.body.event_log;
  if (!raw) return;

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    console.log("❌ JSON parse error");
    return;
  }

  if (
    event.eventType !== "AccessControllerEvent" ||
    event.AccessControllerEvent.majorEventType !== 5 ||
    event.AccessControllerEvent.subEventType !== 75
  ) {
    return;
  }

  console.log("✅ FACE EVENT:", event.AccessControllerEvent.name);

  const payload = {
    name: event.AccessControllerEvent.name,
    employeeNo: event.AccessControllerEvent.employeeNoString,
    date: event.dateTime,
  };

  try {
    const jurnal = await Jurnal.findById("6979b853e358ab5d3fb44cb1");
    if (!jurnal) return;

    const employee = await Employee.findOne({
      employeeNo: payload.employeeNo,
    });
    console.log(employee);
    if (!employee) return;

    const exists = await Attendance.findOne({
      jurnalId: jurnal._id,
      name: payload.name,
    });

    if (exists) return;

    await Attendance.create({
      jurnalId: jurnal._id,
      employeeId: employee._id,
      employeeNo: payload.employeeNo,
      name: payload.name,
      date: payload.date,
    });

    const attendances = await Attendance.find().populate("employeeId");

    global.io.emit("face-success", attendances);
  } catch (err) {
    console.error("❌ FACE EVENT ERROR:", err);
  }
};
