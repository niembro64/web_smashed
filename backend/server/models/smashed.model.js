const mongoose = require('mongoose');
const minLength = 3;
const SmashedSchema = new mongoose.Schema(
  {
    smashConfig: {
      type: String,
      required: [true, 'Smash config is required'],
      minlength: [minLength, 'Smash config must be at least 3 characters'],
    },
    debug: {
      type: String,
      required: [true, 'Debug is required'],
      minlength: [minLength, 'Debug must be at least 3 characters'],
    },
    ip: {
      type: String,
      required: [true, 'IP is required'],
      minlength: [minLength, 'IP must be at least 3 characters'],
    },
    momentCreated: {
      type: String,
      required: [true, 'Time stamp is required'],
      minlength: [minLength, 'Time stamp must be at least 3 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
    clientVisits: {
      type: String,
      required: [true, 'Client visits is required'],
    },
    countryArea: {
      type: String,
      required: [true, 'Country area is required'],
    },
    latitude: {
      type: String,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: String,
      required: [true, 'Longitude is required'],
    },
    network: {
      type: String,
      required: [true, 'Network is required'],
    },
    postal: {
      type: String,
      required: [true, 'Postal is required'],
    },
    matrixShotsUnto: {
      type: String,
      required: [true, 'Matrix shots unto is required'],
    },
    matrixDeathsUnto: {
      type: String,
      required: [true, 'Matrix deaths unto is required'],
    },
    matrixHitsUnto: {
      type: String,
      required: [true, 'Matrix hits unto is required'],
    },
  },
  { timestamps: true }
);
const Smashed = mongoose.model('Smashed', SmashedSchema);
module.exports = Smashed;
// ${minLength}
