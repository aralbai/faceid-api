import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    jurnalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // 👈 Employee model nomi
      required: true,
    },
    employeeNo: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Qatnashgan", "Naryad", "Ruxsatli", "Ta'til", "Kasal"],
      default: "Qatnashgan",
    },
  },
  { timestamps: true },
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
