const mongoose = require('mongoose');

const PasswordConfSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchema',
    required: true
  },
  generated: { type: Date, required: true}
})

module.exports = mongoose.model('PasswordConfSchema', PasswordConfSchema);
