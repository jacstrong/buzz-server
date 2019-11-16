const mongoose = require('mongoose');

const EmailConfirmationSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchema',
    required: true
  },
  code: { type: String, required: true},
  generated: { type: Date, required: true}
})

EmailConfirmationSchema.methods.generateCode = function () {
  let code = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  this.code = code
  console.log(this.code)
  this.generated = new Date();
}

EmailConfirmationSchema.methods.getCode = function () {
  return this.code
}

module.exports = mongoose.model('EmailConfirmationSchema', EmailConfirmationSchema);
