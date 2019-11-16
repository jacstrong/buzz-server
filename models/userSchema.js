const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  emailConfirmed: { type: Boolean, required: true },
  active: { type: Boolean, required: true },
  createDate: { type: Date, required: true },
  lastLogin: { type: Date, required: true },
  isSubAccount: { type: Boolean, required: true },
  accountParentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchema'
  },
  permissions: [String]
})

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
}

UserSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
}

UserSchema.methods.generateJWT = function () {
  
  this.lastLogin = new Date();

  return jwt.sign({
    email: this.email,
    id: this._id,
    permissions: this.permissions
  }, 'secret', { expiresIn: '1d' }); // TODO: Set Secret
}

UserSchema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    token: this.generateJWT()
  };
}

// UserSchema.query.byEmail = function (email) {
//   return this.where()
// }

module.exports = mongoose.model('UserSchema', UserSchema);
