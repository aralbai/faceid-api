import Bolim from "../models/Bolim.js";


export const getBolims = async (req, res) => {
  try {
    const bolim = await Bolim.find();

    return res.status(200).json(bolim);
  } catch (error) {
   return  res.status(500).json({ error: 'Server error' });
  }
};

export const getBolimById = async (req, res) => {     
  const { bolimId } = req.params;

  try {
    const bolim = await Bolim.findById(bolimId);  

    if (!bolim) {   
      return res.status(404).json({ error: 'Bolim not found' });
    }

    return res.status(200).json(bolim);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

