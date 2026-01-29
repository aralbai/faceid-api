import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  bolim: String,
  name: String,
  date: Date,
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
