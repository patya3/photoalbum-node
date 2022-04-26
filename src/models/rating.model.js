const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  comment: { type: String, required: true },
  user: {
    id: { type: String, required: true },
    username: { type: String, required: true },
  },
});

const ratingSchema = new mongoose.Schema(
  {
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    imageId: { type: String, required: true },
    user: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },
    replies: [replySchema],
  },
  { collection: 'ratings', timestamps: { createdAt: true, updatedAt: false } }
);

mongoose.model('rating', ratingSchema);
