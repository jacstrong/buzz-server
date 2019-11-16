const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../../auth');
const email = require('../../plugins/email');
const UserSchema = mongoose.model('UserSchema');
const EmailConfirmationSchema = mongoose.model('EmailConfirmationSchema');

router.post('/:id'/* , auth.optional */, (req, res, next) => {
  const confirmationID = req.params.id;

  EmailConfirmationSchema.findByIdAndRemove(confirmationID, (err, emailDoc) => {
    if (err) return res.status(422).json({ error: { message: "could not process request", detail: err }})
    
    UserSchema.findByIdAndUpdate(emailDoc.userID, { emailConfirmed: true }, (err, userDoc) => {
      if (err) return res.status(422).json({ error: { message: "could not process request", detail: err }})
        res.json({ message: 'email has been verified'})
      })
    })
})


router.delete('/:id'/* , auth.optional */, (req, res, next) => {
  const confirmationID = req.params.id;

  EmailConfirmationSchema.findByIdAndRemove(confirmationID, (err, emailDoc) => {
    if (err) return res.status(422).json({ error: { message: "could not process request", detail: err }})
    
    UserSchema.findByIdAndUpdate(emailDoc.userID, { active: false }, (err, userDoc) => {
      if (err) return res.status(422).json({ error: { message: "could not process request", detail: err }})
        res.json({ message: 'account has been deleted'})
      })
    })
})

module.exports = router;
