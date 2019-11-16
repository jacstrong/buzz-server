const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../../auth');
const email = require('../../plugins/email');
const jwt = require('jsonwebtoken')
const AdminSchema = mongoose.model('AdminSchema');
const EmailConfirmationSchema = mongoose.model('EmailConfirmationSchema');


router.use('/emailconfirmation', require('./emailConfirmation'));
router.use('/password', require('./password'));

/**
 * @api {post} api/admin/user/
 * @apiName CreateAdmin
 * @apiGroup Admin
 *
 * @apiParam {String} name first name of admin
 * @apiParam {String} email email of admin
 * @apiParam {String} password password of admin
 * @apiParamExample {json} Post-example:
 *  {
 *    name: String,
 *    email: String,
 *    password: String
 *  }
 * 
 * @apiSuccess {String} firstname Firstname of the admin.
 * @apiSuccess {String} _id ID of the admin.
 * @apiSuccess {String} email Email of the admin.
 * @apiSuccess {String} token JWT of the user.
 * @apiDescription This is almost identical to the user route, but it requires that they already be logged in to create a new admin
 * Only admins can make admins.
 */
router.post('/', auth.required, auth.ensureAdmin, (req, res, next) => {
  const request = req.body;
  
  let admin = {}
  
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
  admin.name = request.name;
  
  if (!request.email) {
    return res.status(422).json({
      error: {
        email: 'is required'
      }
    });
  }
  admin.email = request.email;
  
  if (!request.password) {
    return res.status(422).json({
      error: {
        password: 'is required'
      }
    });
  }

  if (!req.user.id) {
    return res.status(422).json({
      error: {
        message: 'unable to process request'
      }
    })
  }
  admin.creatorID = req.user.id;


  admin.password = request.password;
  admin.emailConfirmed = false;
  admin.active = true;
  admin.createDate = new Date();
  admin.lastLogin = new Date();
  admin.isSubAccount = false;
  
  AdminSchema.findOne({ email: request.email, active: true, emailConfirmation: true }, (err, doc) => {
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
 * @api {get} api/admin/user/
 * @apiName Check current user
 * @apiGroup AdminUser
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
 * @api {post} api/admin/user/login
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

  return passport.authenticate('admin-local', { session: false }, (err, passportUser, info) => {
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
