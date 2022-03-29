const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    parentId: {type: String, default: null}
  },
  { collection: 'categories' }
);

mongoose.model('category', citySchema);
