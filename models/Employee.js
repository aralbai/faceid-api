import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeNo: String,
  name: String,
  unvon: String,
  lavozim: String,
  pnfl: String,
  bolim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bolim",
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
