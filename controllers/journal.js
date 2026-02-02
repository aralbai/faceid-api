import Jurnal from "../models/Jurnal.js";

export const createJurnal = async (req, res) => {
  try {
    const newJurnal = new Jurnal({
      name: req.body.name,
      date: req.body.date,
    });

    await newJurnal.save();

    return res.status(200).json("Jurnal jaratildi");
  } catch (error) {
    return res.status(500).json("server error");
  }
};
