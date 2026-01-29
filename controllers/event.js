import Jurnal from "../model/Jurnal.js";
import Attendance from "../model/Attendance.js";

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
    bolim: event.AccessControllerEvent.employeeNoString,
    date: event.dateTime,
  };

  try {
    const jurnal = await Jurnal.findById("697b76345bac745f6fd2df00");
    if (!jurnal) return;

    const exists = await Attendance.findOne({
      jurnalId: jurnal._id,
      name: payload.name,
    });

    if (exists) return;

    await Attendance.create({
      jurnalId: jurnal._id,
      name: payload.name,
      bolim: payload.bolim,
      date: payload.date,
    });

    const attendances = await Attendance.find();

    global.io.emit("face-success", attendances);
  } catch (err) {
    console.error("❌ FACE EVENT ERROR:", err);
  }
};
