const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    countryId: { type: String, required: true },
    subcountryId: { type: String, required: true },
  },
  { collection: 'cities' }
);

mongoose.model('city', citySchema);
