const mongoose = require('mongoose');

const UserSettingsSchema = mongoose.Schema({
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchema',
    required: true
  },
  queues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "QueueSchema"
  }],
  countryPrefix: {
      type: String,
      default: 'US',
      required: true
  }
})

module.exports = mongoose.model('UserSettingsSchema', UserSettingsSchema);
