import mongoose from "mongoose";

const activeJurnalSchema = new mongoose.Schema(
  {
    jurnalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jurnal",
      required: true,
    },
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
  },
  { timestamps: true },
);

const ActiveJurnal = mongoose.model("ActiveJurnal", activeJurnalSchema);

export default ActiveJurnal;
