import ActiveJurnal from "../models/ActiveJurnal.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

export const faceEventHandler = async (req, res) => {
  const t0 = Date.now();

  // ⚠️ Kamera tez qaytish kutadi
  res.status(200).send("OK");
  console.log("⏱️ 0. RESPONSE SENT:", Date.now() - t0, "ms");

  // 📥 Event ma'lumotlarini olish
  const raw = req.body.AccessControllerEvent;
  if (!raw) {
    console.log("❌ NO RAW BODY:", Date.now() - t0, "ms");
    return;
  }

  // 🛠️ JSON parse qilish
  let event;
  try {
    event = JSON.parse(raw);
    console.log("⏱️ 1. JSON PARSED:", Date.now() - t0, "ms");
  } catch (err) {
    console.log("❌ JSON PARSE ERROR:", err);
    return;
  }

  // 🔍 Kerakli eventni tekshirish
  if (
    event.eventType !== "AccessControllerEvent" ||
    event.AccessControllerEvent.majorEventType !== 5 ||
    event.AccessControllerEvent.subEventType !== 75
  ) {
    console.log("⏱️ SKIPPED (NOT FACE EVENT):", Date.now() - t0, "ms");
    return;
  }

  // 📝 Payload tayyorlash
  const payload = {
    name: event.AccessControllerEvent.name,
    employeeNo: event.AccessControllerEvent.employeeNoString,
    date: event.dateTime,
  };
  console.log("⏱️ 2. PAYLOAD READY:", Date.now() - t0, "ms");

  try {
    // 📝 Aktiv jurnalni olish
    const jStart = Date.now();
    const jurnal = await ActiveJurnal.find();
    console.log(
      "⏱️ 3. ACTIVE JURNAL QUERY:",
      Date.now() - jStart,
      "ms | TOTAL:",
      Date.now() - t0,
      "ms",
    );

    if (!jurnal || jurnal.length === 0) return;

    // 👤 Xodimni employeeNo bo'yicha tekshirish
    const eStart = Date.now();
    const employee = await Employee.findOne({
      employeeNo: payload.employeeNo,
    });
    console.log(
      "⏱️ 4. EMPLOYEE QUERY:",
      Date.now() - eStart,
      "ms | TOTAL:",
      Date.now() - t0,
      "ms",
    );

    if (!employee) return;

    // ✅ Attendance mavjudligini tekshirish
    const exStart = Date.now();
    const exists = await Attendance.findOne({
      jurnalId: jurnal[0].jurnalId,
      name: payload.name,
    });
    console.log(
      "⏱️ 5. DUPLICATE CHECK:",
      Date.now() - exStart,
      "ms | TOTAL:",
      Date.now() - t0,
      "ms",
    );

    if (exists) return;

    // 📝 Attendance yaratish
    const cStart = Date.now();
    await Attendance.create({
      jurnalId: jurnal[0].jurnalId,
      employeeId: employee._id,
      employeeNo: payload.employeeNo,
      name: payload.name,
      date: payload.date,
    });
    console.log(
      "⏱️ 6. ATTENDANCE CREATE:",
      Date.now() - cStart,
      "ms | TOTAL:",
      Date.now() - t0,
      "ms",
    );

    // 🔄 Barcha attendance larni olish + populate
    const fStart = Date.now();
    const attendances = await Attendance.find({
      jurnalId: jurnal[0].jurnalId,
    }).populate({
      path: "employeeId",
      populate: {
        path: "bolim",
        model: "Bolim",
      },
    });
    console.log(
      "⏱️ 7. FIND + POPULATE:",
      Date.now() - fStart,
      "ms | TOTAL:",
      Date.now() - t0,
      "ms | COUNT:",
      attendances.length,
    );

    // 📡 Socket emit
    const sStart = Date.now();
    global.io.emit("face-success", attendances);
    console.log(
      "⏱️ 8. SOCKET EMIT:",
      Date.now() - sStart,
      "ms | TOTAL:",
      Date.now() - t0,
      "ms",
    );

    console.log("✅ DONE TOTAL TIME:", Date.now() - t0, "ms");
  } catch (err) {
    console.error("❌ FACE EVENT ERROR:", err);
  }
};
