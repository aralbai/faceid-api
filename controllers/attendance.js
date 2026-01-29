import Attendance from "../model/Attendance.js";

export const createAttendance = async (req, res) => {
  try {
    const newAttendance = new Attendance({
      jurnalId: req.body.jurnalId,
      name: req.body.name,
      bolim: req.body.bolim,
      date: req.body.date,
    });

    await newAttendance.save();

    return res.status(200).json("Barlaw");
  } catch (error) {
    return res.status(500).json("server error");
  }
};

export const getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.find();

    return res.status(200).json(attendances);
  } catch (error) {
    return res.status(500).json("server error");
  }
};
