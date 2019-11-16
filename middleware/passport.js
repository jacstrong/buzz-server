const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const UserSchema = mongoose.model('UserSchema');
const AdminSchema = mongoose.model('AdminSchema');

passport.use('dispatch-local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  UserSchema.findOne({ email: email, emailConfirmed: true })
    .then((user) => {
      if(!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid'} });
      }
      console.log(user)
      return done(null, user);
    }).catch(done);
}));


passport.use('admin-local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  AdminSchema.findOne({ email })
    .then((user) => {
      if(!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid'} });
      }

      return done(null, user);
    }).catch(done);
}));
