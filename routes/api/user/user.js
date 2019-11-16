const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../../auth');
const email = require('../../plugins/email');
const jwt = require('jsonwebtoken')
const UserSchema = mongoose.model('UserSchema');
const EmailConfirmationSchema = mongoose.model('EmailConfirmationSchema');


router.use('/emailconfirmation', require('./emailConfirmation'));
router.use('/password', require('./password'));

/**
 * @api {post} api/user/
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {String} name name of user
 * @apiParam {String} email email of user
 * @apiParam {String} password password of user
 * @apiParamExample {json} Post-example:
 *  {
 *    name: String,
 *    email: String,
 *    password: String
 *  }
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} _id ID of the user.
 * @apiSuccess {String} email Email of the user.
 * @apiSuccess {String} token JWT of the user.
 */
router.post('/'/* , auth.optional */, (req, res, next) => {
  const request = req.body;
  
  let user = {}
  
  if (!request) {
    return res.status(422).json({
      error: {
        message: "email and password are required"
      }
    })
  }
  
  if (!request.name) {
    return res.status(422).json({
      error: {
        message: "name is required"
      }
    })
  }
  user.name = request.name;
  
  if (!request.email) {
    return res.status(422).json({
      error: {
        email: 'is required'
      }
    });
  }
  user.email = request.email;
  
  if (!request.password) {
    return res.status(422).json({
      error: {
        password: 'is required'
      }
    });
  }
  user.password = request.password;
  user.emailConfirmed = false;
  user.active = true;
  user.createDate = new Date();
  user.lastLogin = new Date();
  user.isSubAccount = false;
  user.permissions = ['Owner']
  
  UserSchema.findOne({ email: request.email, active: true, emailConfirmation: true }, (err, doc) => {
    if (err) return res.status(500).json({ error: { message: 'server error'}})
    if (doc != null) {
      return res.status(422).json({
        error: {
          message: 'email already in use' // TODO: don't let them know there is an account.
        }
      });
    } else {
      const finalUser = new UserSchema(user);
      
      finalUser.setPassword(user.password);
      
      const emailConfirmation = new EmailConfirmationSchema({ userID: finalUser._id })
      emailConfirmation.generateCode()
      let emailData = {
        code: emailConfirmation.getCode(),
        firstName: finalUser.firstName,
        confirmationID: emailConfirmation._id,
        email: request.email
      }
      
      emailConfirmation.save()
      
      email.accountConfirmation(emailData);
      
      return finalUser
      .save()
      .then(() => res.json({ user: finalUser.toAuthJSON() }))
      .catch((err) => console.log(err.message));
    }
  });
})


/**
 * @api {get} api/user/
 * @apiName Check current user
 * @apiGroup User
 *
 * @apiHeader {String} Authorization JWT.
 * @apiParamExample {json} Post-example:
 *  {
 *    firstName: String,
 *    lastName: String,
 *    email: String,
 *    password: String
 *  }
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {Boolean} success If the user is validated it will return true otherwise false.
 */
router.get('/', auth.optional, (req, res, next) => {
  if (req.user) {
    return res.json({message: 'Token is valid', success: true }).send()
  } else {
    return res.json({message: 'Token missing or invalid', success: false }).send()
  }  
});

/**
 * @api {post} api/user/login
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} email email of user
 * @apiParam {String} password password of user
 * @apiParamExample {json} Post-example:
 *  {
 *    email: String,
 *    password: String
 *  }
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} _id ID of the user.
 * @apiSuccess {String} email Email of the user.
 * @apiSuccess {String} token JWT of the user.
 */
router.post('/login'/* , auth.optional */, (req, res, next) => {
  const request = req.body;

  if (!request) {
    return res.status(422).json({
      error: {
        message: "email and password are required"
      }
    })
  }

  if (!request.email) {
    return res.status(422).json({
      error: {
        email: 'is required',
      },
    });
  }

  if (!request.password) {
    return res.status(422).json({
      error: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('dispatch-local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const user = passportUser.toAuthJSON();
      passportUser.save()

      return res.json({ user: user, success: true });
    }

    return res.status(401).json({ error: { message: 'email or password incorrect' }});
  })(req, res, next);
  // });  // TODO: Test this line
});



module.exports = router;
