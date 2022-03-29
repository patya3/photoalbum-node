const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    photoUrl: { type: String, required: true },
    category: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    location: {
      country: {
        id: { type: String, required: true },
        name: { type: String, required: true },
      },
      subcountry: {
        id: { type: String, required: true },
        name: { type: String, required: true },
      },
      city: {
        id: { type: String, required: true },
        name: { type: String, required: true },
      },
    },
    user: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },
  },
  { collection: 'images', timestamps: true }
);

mongoose.model('image', imageSchema);
