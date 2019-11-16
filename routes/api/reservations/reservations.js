/*
    /api/reservations
*/

const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('../../auth')

const QueueSchema = mongoose.model('QueueSchema')
const ReservationSchema = mongoose.model('ReservationSchema')
const ContactSchema = mongoose.model('ContactSchema')

const plivo = require('plivo');
const client = new plivo.Client(
  require('./config.json').auth_id,
  require('./config.json').auth_token);

router.post('/', auth.required, (req, res, next) => {
    console.log("POST REQUEST!!!!!")
    const newContact = new ContactSchema()
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
            date: req.body.date,
            time: req.body.time,
            // state: 'Waiting',
            // timestamp: req.body.timestamp,
            partyNum: req.body.partyNum,
            contactID: doc._id,
            ownerID: req.user.id
        }
        const newReservation = new ReservationSchema(data)

        return newReservation.save((err, doc) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                    trace: process.env.NODE_ENV === 'dev' ? err : ''
                })
            }

            client.messages.create(
                // '+1(435)535-0581',
                '+1435-252-9809',
                '13854998403',
                // doc.phoneNumber,
                'You have placed a reservation. We look forward to having you!'
            ).then(function(message_created) {
                console.log(message_created)
            })
            return res.json(doc)

        })
    })
})

router.post('/notify', auth.required, (req, res, next) => {
    ReservationSchema.findByIdAndUpdate({ownerID: req.user.id, _id: req.body.id},
        {state: 'Notified'}).exec()
    res.json({success: true})
    client.messages.create(
        // '+1(435)535-0581',
        '+1435-252-9809',
        '13854998403',
        // doc.phoneNumber,
        'Your table is ready! 🥐🍲'
      ).then(function(message_created) {
        console.log(message_created)
      })
})

router.post('/remove', auth.required, (req, res, next) => {
    ReservationSchema.findOneAndDelete({ownerID: req.user.id, _id: req.body.id},
        (err, doc) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                    trace: process.env.NODE_ENV === 'dev' ? err : ''
                })
            }
            return res.json({success: true})
        })

})


module.exports = router
