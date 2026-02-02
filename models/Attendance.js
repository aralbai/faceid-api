import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  jurnalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // 👈 Employee model nomi
    required: true,
  },
  employeeNo: String,
  name: String,
  date: Date,
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
