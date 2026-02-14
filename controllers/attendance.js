import ActiveJurnal from "../models/ActiveJurnal.js";
import Attendance from "../models/Attendance.js";

export const createAttendance = async (req, res) => {
  try {
    const newAttendance = new Attendance({
      jurnalId: req.body.jurnalId,
      employeeId: req.body.employeeId,
      employeeNo: req.body.employeeNo,
      name: req.body.name,
      status: req.body.status,
    });

    await newAttendance.save();

    return res.status(200).json("Barlaw");
  } catch (error) {
    console.error(error);
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

export const getAttendancesByJurnalId = async (req, res) => {
  const { jurnalId } = req.params;

  try {
    const attendances = await Attendance.find({
      jurnalId: jurnalId,
    }).populate({
      path: "employeeId",
      populate: {
        path: "bolim",
      },
    });

    return res.status(200).json(attendances);
  } catch (error) {
    return res.status(500).json("server error");
  }
};

export const getAttendancesByActiveJurnal = async (req, res) => {
  try {
    const activeJurnal = await ActiveJurnal.find();
    if (!activeJurnal || activeJurnal.length === 0) {
      return res.status(404).json("Tadbir belgilanmagan");
    }

    const attendances = await Attendance.find({
      jurnalId: activeJurnal[0].jurnalId,
    }).populate({
      path: "employeeId",
      populate: {
        path: "bolim",
      },
    });

    return res.status(200).json(attendances);
  } catch (error) {
    return res.status(500).json("server error");
  }
};

export const getLastFaceAttendance = async (req, res) => {
  try {
    const activeJurnal = await ActiveJurnal.find();
    if (!activeJurnal || activeJurnal.length === 0) {
      return res.status(404).json("Tadbir belgilanmagan");
    }

    const lastAttendance = await Attendance.findOne({
      jurnalId: activeJurnal[0].jurnalId,
    })
      .sort({ _id: -1 })
      .populate({
        path: "employeeId",
        populate: {
          path: "bolim",
        },
      });

    return res.status(200).json(lastAttendance);
  } catch (error) {
    return res.status(500).json("server error");
  }
};

export const deleteAttendance = async (req, res) => {
  const { attendanceId } = req.params;

  try {
    await Attendance.deleteOne({ employeeId: attendanceId });

    return res.status(200).json("Attendance deleted");
  } catch (error) {
    return res.status(500).json("server error");
  }
};
