/*
    /api/contact
*/

const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('../../auth')

const ContactSchema = mongoose.model('ContactSchema')
const QueueSchema = mongoose.model('QueueSchema')

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
