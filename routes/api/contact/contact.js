/*
    /api/contact
*/

const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('../../auth')

const ContactSchema = mongoose.model('ContactSchema')
const QueueSchema = mongoose.model('QueueSchema')
const ReservationSchema = mongoose.model('ReservationSchema')

const plivo = require('plivo');
const client = new plivo.Client(
    require('./config.json').auth_id,
    require('./config.json').auth_token);

router.post('/', auth.required, (req, res, next) => {
  const newContact = new ContactSchema
  newContact.ownerID = req.user.id
  newContact.name = req.body.name
  newContact.phoneNumber = req.body.phoneNumber
  return newContact.save((err, doc) => {
      if (err) {
          return res.status(500).json({
              message: err.message,
              trace: process.env.NODE_ENV === 'dev' ? err : ''
          })
      }
      
      let data = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        state: 'Waiting',
        timestamp: req.body.timestamp,
        partyNum: req.body.partyNum
      }
      
      QueueSchema.findOneAndUpdate({ownerID: req.user.id, name: 'Walk In'}, { $push: {queue: data}}, (err, doc) => {
        if (err) {
          return res.status(500).json({
              message: err.message,
              trace: process.env.NODE_ENV === 'dev' ? err : ''
          })
        }
        doc.queue.push(data)
      client.messages.create(
          // '+1(435)535-0581',
          '+1435-252-9809',
          '18018371198',
          // doc.phoneNumber,
          'You have been put on the waitlist. We will have you seated shortly!'
      ).then(function(message_created) {
          console.log(message_created)
      })
        return res.json(doc)
      })


  })
})

router.get('/', auth.required, (req, res, next) => {
  ContactSchema.find({ownerID: req.user.id}, (err, doc) => {
    if (err) {
      return res.status(500).json({
          message: err.message,
          trace: process.env.NODE_ENV === 'dev' ? err : ''
      })
    }
    return res.json(doc)
  }
)})


module.exports = router
