const mongoose = require('mongoose');

const subcountrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    countryId: { type: String, required: true },
  },
  { collection: 'subcountries' }
);

mongoose.model('subcountry', subcountrySchema);
