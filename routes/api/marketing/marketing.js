/*
    /api/marketing
*/

const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('../../auth')

const plivo = require('plivo');
const client = new plivo.Client(
  require('./config.json').auth_id,
  require('./config.json').auth_token);

const ContactSchema = mongoose.model('ContactSchema')

router.get('/stats', auth.required, (req, res, next) => {
    ContactSchema.countDocuments({ownerID: req.user.id}, (err, totalContacts) => {
      if (err) {
        return res.status(500).send('it broke')
      }
      ContactSchema.countDocuments({ownerID: req.user.id, wantsMarketing: false}, (err, engaged) => {
        if (err) {
          return res.status(500).send('it really broke')
        }
        return res.json({totalContacts: totalContacts, engaged: engaged})
      })
    })
})

router.post('/campaign', auth.required, (req, res, next) => {
  client.messages.create(
    // '+1(435)535-0581',
    '+1435-252-9809',
    '13854998403',
    // doc.phoneNumber,
    req.body.message
  ).then(function(message_created) {
    console.log(message_created)
    return res.json('Success')
  })
})

router.post('/targeted', auth.required, (req, res, next) => {
  client.messages.create(
    // '+1(435)535-0581',
    '+1435-252-9809',
    '13854998403',
    // doc.phoneNumber,
    req.body.message
  ).then(function(message_created) {
    console.log(message_created)
    return res.json('Success')
  })
})


module.exports = router
