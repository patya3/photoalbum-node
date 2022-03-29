const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { collection: 'countries' }
);

mongoose.model('country', countrySchema);
