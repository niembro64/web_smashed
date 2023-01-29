const mongoose = require('mongoose');

const minLength = 3;

const SmashedSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: [true, 'IP is required'],
      minlength: [minLength, 'IP must be at least 3 characters'],
    },
    timeStamp: {
      type: String,
      required: [true, 'Time stamp is required'],
      minlength: [minLength, 'Time stamp must be at least 3 characters'],
    },
  },
  { timestamps: true }
);

const Smashed = mongoose.model('Smashed', SmashedSchema);

module.exports = Smashed;

// ${minLength}
