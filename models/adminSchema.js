const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


const AdminSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  active: { type: Boolean, required: true },
  createDate: { type: Date, required: true },
  lastLogin: { type: Date, required: true },
  creatorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchema'
  },
  permissions: [String]
})

AdminSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
}

AdminSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
}

AdminSchema.methods.generateJWT = function () {
  
  this.lastLogin = new Date();

  return jwt.sign({
    email: this.email,
    id: this._id,
    permissions: this.permissions,
    admin: true
  }, process.env.NODE_ENV === 'dev' ? 'secret' : process.env.SECRET, { expiresIn: '10h' }); // TODO: Set Secret
}

AdminSchema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    email: this.email,
    token: this.generateJWT()
  };
}

// AdminSchema.query.byEmail = function (email) {
//   return this.where()
// }

module.exports = mongoose.model('AdminSchema', AdminSchema);
