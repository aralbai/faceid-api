import mongoose from 'mongoose';

const BolimSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Bolim = mongoose.model('Bolim', BolimSchema);

export default Bolim;