const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../../auth');
const email = require('../../plugins/email');
const UserSchema = mongoose.model('UserSchema');
const PasswordConfSchema = mongoose.model('PasswordConfSchema');

/**
 * @api {post} api/user/password/forgotpassword/
 * @apiName ForgotPasswordRequest
 * @apiGroup Password
 *
 * @apiParam {String} email email of user
 * @apiParamExample {json} Post-example:
 *  {
 *    email: String,
 *  }
 * 
 * @apiSuccess {String} message Password successfully changed
 * 
 * @apiDescription This is for submitting a request for a password change if someone has forgotten their password.
 * It will send an email if the specified email exists in the database otherwise it ignores the requset.
 */

router.post('/forgotpassword', auth.optional, (req, res, next) => {
  const reqEmail = req.body.email;

  if (!reqEmail) {
    return res.status(422).json({
      error: {
        message: "email is required"
      }
    })
  }

  UserSchema.findOne({ email: reqEmail }, (err, doc) => {
    if (err) return res.status(500).send();
    if (doc === null) return res.json({ message: 'request has been sent'});
    
    const passReq = new PasswordConfSchema();

    passReq.userID = doc._id;
    passReq.generated = new Date();

    email.forgotPassword({ firstName: doc.firstName, confirmationID: passReq._id });

    passReq.save();
    return res.json({ message: 'request has been sent' })
  })
})

/**
 * @api {post} api/user/password/forgotpassword/:id
 * @apiName ForgotPasswordSubmit
 * @apiGroup Password
 *
 * @apiParam {String} password password of user
 * @apiParamExample {json} Post-example:
 *  {
 *    password: String,
 *  }
 * 
 * @apiSuccess {String} message Password successfully changed
 * 
 * @apiDescription This route is for setting the password after getting the password reset email.
 */

router.post('/forgotpassword/:id', auth.optional, (req, res, next) => {
  const id = req.params.id;
  const password = req.body.password

  if (!password) {
    return res.status(422).json({
      error: {
        message: "password"
      }
    })
  }

  PasswordConfSchema.findByIdAndRemove(id, (err, doc) => {
    if (err) return res.status(500).json({ error: { message: 'invalid reset id'}}).send();
    if (doc === null) return res.status(422).json({ error: { message: 'password reset request could not be found' }});

    UserSchema.findById(doc.userID, (err, doc) => {
      if (err) return res.status(500).send();
      if (doc === null) return res.status(422).json({ error: { message: 'password reset request could not be found' }});

      doc.setPassword(password)
      doc.save()
      return res.json({message: 'password has been reset'});
    })
  })
})

module.exports = router;
