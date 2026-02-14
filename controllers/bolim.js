import Bolim from "../models/Bolim.js";
import Employee from "../models/Employee.js";
import Jurnal from "../models/Jurnal.js";
import Attendance from "../models/Attendance.js";

export const getBolims = async (req, res) => {
  try {
    const bolim = await Bolim.find();

    return res.status(200).json(bolim);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getBolimById = async (req, res) => {
  const { bolimId } = req.params;

  try {
    const bolim = await Bolim.findById(bolimId);

    if (!bolim) {
      return res.status(404).json({ error: "bolim not found" });
    }

    return res.status(200).json(bolim);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getBolimCountInDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Date range required" });
    }

    // Timezone (Uzbekistan +5)
    const start = new Date(startDate + "T00:00:00.000+05:00");
    const end = new Date(endDate + "T23:59:59.999+05:00");

    // 1️⃣ Shu oraliqdagi tadbirlar soni
    const eventCount = await Jurnal.countDocuments({
      date: { $gte: start, $lte: end },
    });

    // 2️⃣ Barcha bo‘limlar
    const bolims = await Bolim.find();

    const result = [];

    for (const dep of bolims) {
      // 3️⃣ Shu bo‘lim employee soni
      const employeeCount = await Employee.countDocuments({
        bolim: dep._id,
      });

      const totalPossible = employeeCount * eventCount;

      // 4️⃣ Attendance aggregation (Employee orqali bo‘lim topamiz)
      const attendanceStats = await Attendance.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee",
          },
        },
        {
          $unwind: "$employee",
        },
        {
          $match: {
            "employee.bolim": dep._id,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // 5️⃣ Default object
      const stats = {
        bolimNomi: dep.name,
        Qatnashgan: 0,
        Naryad: 0,
        Ruxsatli: 0,
        "Ta'til": 0,
        Kasal: 0,
        Qatnashmagan: 0,
      };

      let totalRecorded = 0;

      attendanceStats.forEach((item) => {
        if (item._id === "Qatnashgan") stats.Qatnashgan = item.count;
        if (item._id === "Naryad") stats.Naryad = item.count;
        if (item._id === "Ruxsatli") stats.Ruxsatli = item.count;
        if (item._id === "Ta'til") stats["Ta'til"] = item.count;
        if (item._id === "Kasal") stats.Kasal = item.count;

        totalRecorded += item.count;
      });

      // 6️⃣ Attendance yozuvi yo‘q bo‘lganlar
      stats.Qatnashmagan =
        totalPossible > totalRecorded ? totalPossible - totalRecorded : 0;

      result.push(stats);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
