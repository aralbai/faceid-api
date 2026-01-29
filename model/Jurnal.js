import mongoose from "mongoose";

const jurnalSchema = new mongoose.Schema({
  name: String,
  date: Date,
});

const Jurnal = mongoose.model("Jurnal", jurnalSchema);

export default Jurnal;
