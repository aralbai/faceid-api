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

export const getJurnal = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json("Id majburiy");

  try {
    const jurnal = await Jurnal.findById(id);

    return res.status(200).json(jurnal);
  } catch (error) {
    return res.status(500).json("server error");
  }
};
