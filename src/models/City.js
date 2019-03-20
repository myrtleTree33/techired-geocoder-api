import mongoose from 'mongoose';

let mongooseHidden = require('mongoose-hidden')();

const { Schema } = mongoose;

const citySchema = new Schema({
  twoCharCountryCode: {
    type: String,
    required: true
  },
  countryName: {
    type: String,
    required: true
  },
  cityName: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  lat: {
    type: Number,
    required: true
  },
  lon: {
    type: Number,
    required: true
  }
});

// This will add `id` in toJSON
citySchema.set('toJSON', {
  virtuals: true
});

// This will remove `_id` and `__v`
citySchema.plugin(mongooseHidden);

export default mongoose.model('City', citySchema);
