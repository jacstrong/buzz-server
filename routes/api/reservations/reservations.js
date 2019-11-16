/*
    /api/reservations
*/

const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('../../auth')

const QueueSchema = mongoose.model('QueueSchema')
const ReservationSchema = mongoose.model('ReservationSchema')
const ContactSchema = mongoose.model('ContactSchema')


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
            state: 'Waiting',
            timestamp: req.body.timestamp,
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
            return res.json(doc)

        })
    })
})
module.exports = router
