import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeNo: String,
  name: String,
  unvon: String,
  lavozim: String,
  pnfl: String,
  bolim: String,
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
