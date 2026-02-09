import Jurnal from "../models/Jurnal.js";

export const createJurnal = async (req, res) => {
  const { name, date, startTime, endTime } = req.body;

  if (!name || !date || !startTime || !endTime) {
    return res.status(400).json("Barcha maydonlar to'ldirilishi majburiy!");
  } 

  try {
    const newJurnal = new Jurnal({
      name: req.body.name,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });

    await newJurnal.save();

    return res.status(200).json("Yangi tadbir qo'shildi");
  } catch (error) {
    return res.status(500).json("Serverda xatolik yuz berdi!");
  }
};

export const getJurnal = async (req, res) => {

  const { id } = req.params;

  if (!id) return res.status(400).json("Id majburiy");

  try {
    const jurnal = await Jurnal.findById(id);

    return res.status(200).json(jurnal);
  } catch (error) {
    return res.status(500).json("Serverda xatolik yuz berdi!");
  }
};

export const getJurnals = async (req, res) => {   
  try {
    const jurnals = await Jurnal.find().sort({ createdAt: -1 });

    return res.status(200).json(jurnals);
  } catch (error) {
    return res.status(500).json("Serverda xatolik yuz berdi!");
  }     
};

export const getValidJurnals = async (req, res) => {

  try {
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const jurnals = await Jurnal.find({
      date: { $gte: todayUTC },
    }).sort({ date: 1 });

    return res.status(200).json(jurnals);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Serverda xatolik yuz berdi!");
  }
};


export const deleteJurnal = async (req, res) => {
  const { id } = req.params;    
  if (!id) return res.status(400).json("Id majburiy");

  try {
    await Jurnal.findByIdAndDelete(id); 
    return res.status(200).json("Tadbir o'chirildi");
  } catch (error) {
    return res.status(500).json("Serverda xatolik yuz berdi!");
  }     
};

export const updateJurnal = async (req, res) => {


  const { id } = req.params;    
  if (!id) return res.status(400).json("Id majburiy");    
  try {
    const updatedJurnal = await Jurnal.findByIdAndUpdate(
      id,
      { 
        name: req.body.name,
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      },
      { new: true }
    );    
    return res.status(200).json("Tadbir yangilandi");
  } catch (error) {
    return res.status(500).json("Serverda xatolik yuz berdi!");
  }   
};