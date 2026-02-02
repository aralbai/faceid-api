import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: String,
  unvon: String,
  lavozim: String,
  employeeNo: String,
  pnfl: String,
  bolim: String,
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
