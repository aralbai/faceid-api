import Attendance from "../models/Attendance.js";

export const createAttendance = async (req, res) => {
  try {
    const newAttendance = new Attendance({
      jurnalId: req.body.jurnalId,
      employeeId: req.body.employeeId,
      employeeNo: req.body.bolim,
      name: req.body.name,
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
    const attendances = await Attendance.find().populate("employeeId");

    return res.status(200).json(attendances);
  } catch (error) {
    return res.status(500).json("server error");
  }
};

export const getLastFaceAttendance = async (req, res) => {
  try {
    const lastAttendance = await Attendance.findOne()
      .sort({ _id: -1 })
      .populate("employeeId");

    return res.status(200).json(lastAttendance);
  } catch (error) {
    return res.status(500).json("server error");
  }
};
