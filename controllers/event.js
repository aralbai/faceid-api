import ActiveJurnal from "../models/ActiveJurnal.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

export const faceEventHandler = async (req, res) => {
  // ⚠️ Kamera tez qaytish kutadi
  res.status(200).send("OK");

  // 📥 Event ma'lumotlarini olish
  const raw = req.body.AccessControllerEvent;
  if (!raw) {
    return;
  }

  // 🛠️ JSON parse qilish
  let event;
  try {
    event = JSON.parse(raw);
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
    return;
  }

  // 📝 Payload tayyorlash
  const payload = {
    name: event.AccessControllerEvent.name,
    employeeNo: event.AccessControllerEvent.employeeNoString,
    date: event.dateTime,
  };

  try {
    // 👤 Xodimni employeeNo bo'yicha tekshirish
    const employee = await Employee.findOne({
      employeeNo: payload.employeeNo,
    });
    if (!employee) return;

    // 📝 Aktiv jurnalni olish
    const activeJurnal = await ActiveJurnal.find();
    if (!activeJurnal || activeJurnal.length === 0) return;

    // ✅ Attendance mavjudligini tekshirish
    const existsAttendance = await Attendance.findOne({
      jurnalId: activeJurnal[0].jurnalId,
      employeeNo: payload.employeeNo,
    });

    // 🚪 Agar chiqish terminaldan event kelsa
    if (event.macAddress === process.env.CAMERE_EXIT_MACADRESS) {
      if (existsAttendance) {
        console.log("🚪 Exit event detected for:", payload.name);
        await Attendance.updateOne(
          { _id: existsAttendance._id },
          { $set: { endDate: payload.date } },
        );
      }
    }

    // 🚪 Agar kirish terminaldan event kelsa
    if (event.macAddress === process.env.CAMERE_ENTER_MACADRESS) {
      if (!existsAttendance) {
        const newAttendance = new Attendance({
          jurnalId: activeJurnal[0].jurnalId,
          employeeId: employee._id,
          employeeNo: payload.employeeNo,
          name: payload.name,
          startDate: payload.date,
        });

        await newAttendance.save();
      }
    }

    // 🔄 Barcha attendance larni olish + populate
    const attendances = await Attendance.find({
      jurnalId: activeJurnal[0].jurnalId,
    }).populate({
      path: "employeeId",
      populate: {
        path: "bolim",
        model: "Bolim",
      },
    });

    // 📡 Socket emit
    global.io.emit("face-success", attendances);
  } catch (err) {
    console.error("❌ FACE EVENT ERROR:", err);
  }
};
