import ActiveJurnal from "../models/ActiveJurnal.js";

export const getActiveJurnal = async (req, res) => {
  try {
    const activeJurnal = await ActiveJurnal.findOne();
    return res.status(200).json(activeJurnal);
  } catch (error) {
    return res.status(500).json("Serverda xatolik yuz berdi!");
  }
};

export const updateActiveJurnal = async (req, res) => {
  const { _id, name, date, startTime, endTime } = req.body;

  if (!_id) return res.status(400).json("JurnalId majburiy");

  try {
    const activeJurnal = await ActiveJurnal.findOne();

    if (activeJurnal) {
      activeJurnal.jurnalId = _id;
      activeJurnal.name = name;
      activeJurnal.date = date;
      activeJurnal.startTime = startTime;
      activeJurnal.endTime = endTime;

      await activeJurnal.save();

      return res.status(200).json("Faol jurnal yangilandi");
    } else {
      const newActiveJurnal = new ActiveJurnal({
        jurnalId: _id,
        name: name,
        date: date,
        startTime: startTime,
        endTime: endTime,
      });

      await newActiveJurnal.save();

      return res.status(200).json("Faol jurnal yaratildi");
    }
  } catch (error) {
    return res.status(500).json("Serverda xatolik yuz berdi!");
  }
};
