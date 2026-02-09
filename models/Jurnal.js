import mongoose from "mongoose";

const jurnalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },    
}, { timestamps: true });

const Jurnal = mongoose.model("Jurnal", jurnalSchema);

export default Jurnal;
