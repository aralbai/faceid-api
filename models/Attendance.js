import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  jurnalId: mongoose.Schema.Types.ObjectId,
  bolim: String,
  name: String,
  date: Date,
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
