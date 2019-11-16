/*
    /api/notify
*/

const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('../../auth')

const plivo = require('plivo');
const client = new plivo.Client(
  require('./config.json').auth_id,
  require('./config.json').auth_token);


const QueueSchema = mongoose.model('QueueSchema')
const ContactSchema = mongoose.model('ContactSchema')

router.post('/ready', auth.required, (req, res, next) => {
  ContactSchema.findById(req.body.contactID, (err, doc) => {
    if (err) {
      res.status(500).json(err)
    }

    client.messages.create(
      // '+1(435)535-0581',
      '+1435-252-9809',
      '18018371198',
      // doc.phoneNumber,
      'You are on the wait list. You will recieve a text when your table is ready.'
    ).then(function(message_created) {
      console.log(message_created)
    });  
      res.json({yup: 'it is'})
  })
})

module.exports = router
