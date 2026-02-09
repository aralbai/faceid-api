import ActiveJurnal from "../models/ActiveJurnal.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

export const faceEventHandler = async (req, res) => {
  // ⚠️ Kamera tez qaytish kutadi
  res.status(200).send("OK");

  // 📥 Event ma'lumotlarini olish
  const raw = req.body.AccessControllerEvent;
  if (!raw) return;

  // 🛠️ JSON parse qilish
  let event;
  try {
    event = JSON.parse(raw);
  } catch (err) {
    console.log("❌ JSON parse error:", err);
    return;
  }

  // 🔍 Kerakli eventni tekshirish
  if (
    event.eventType !== "AccessControllerEvent" ||
    event.AccessControllerEvent.majorEventType !== 5 ||
    event.AccessControllerEvent.subEventType !== 75
  ) {
    return;
  }

  // 📝 Payload tayyorlash
  const payload = {
    name: event.AccessControllerEvent.name,
    employeeNo: event.AccessControllerEvent.employeeNoString,
    date: event.dateTime,
  };

  try {
    // 📝 Aktiv jurnalni olish
    const jurnal = await ActiveJurnal.find();
    if (!jurnal || jurnal.length === 0) return;

    // 👤 Xodimni employeeNo bo'yicha tekshirish
    const employee = await Employee.findOne({
      employeeNo: payload.employeeNo,
    });
    if (!employee) return;

    // ✅ Attendance yozuvining mavjudligini tekshirish
    const exists = await Attendance.findOne({
      jurnalId: jurnal[0].jurnalId,
      name: payload.name,
    });
    if (exists) return;

    // 📝 Attendance yozuvini yaratish
    await Attendance.create({
      jurnalId: jurnal[0].jurnalId,
      employeeId: employee._id,
      employeeNo: payload.employeeNo,
      name: payload.name,
      date: payload.date,
    });

    // 🔄 Barcha attendance yozuvlarini olish va frontendga yuborish
    const attendances = await Attendance.find().populate("employeeId");
    global.io.emit("face-success", attendances);
  } catch (err) {
    console.error("❌ FACE EVENT ERROR:", err);
  }
};
