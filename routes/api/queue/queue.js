/*
    /api/queue
*/

const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('../../auth')

const QueueSchema = mongoose.model('QueueSchema')

router.get('/reservation', auth.required, (req, res, next) => {
    QueueSchema.findOne({ownerID: req.user.id, name: 'Reservation'}).exec((err, doc) => {
        if (err) {
            return res.status(500).json({message: err.message})
        }

        return res.json(doc)
    })
})

router.get('/walkin', auth.required, (req, res, next) => {
    QueueSchema.findOne({ownerID: req.user.id, name: 'Walk In'}).exec((err, doc) => {
        if (err) {
            return res.status(500).json({message: err.message})
        }
        console.log(err, doc)
        return res.json(doc)
    })
})

router.post('/new', auth.required, (req, res, next) => {
    const newQueue = new QueueSchema
    newQueue.ownerID = req.user.id
    newQueue.name = req.body.name
    newQueue.order = req.body.order
    console.log(process.env.NODE_ENV)
    return newQueue.save((err, doc) => {
        if (err) {
            return res.status(500).json({
                message: err.message,
                trace: process.env.NODE_ENV === 'dev' ? err : ''
            })
        }
        res.json(doc)
    })
})

router.post('/walkin', auth.required, (req, res, next) => {
    console.log(req.body.queue)
    QueueSchema.findOne({ownerID: req.user.id, name: 'Walk In'}, (err, doc) => {
        if (err) {
            return res.status(500)
        }
        doc.queue = req.body.queue.queue
        console.log(doc.queue)
        return doc.save()
            .then(() => {
                return res.json(doc)
            })
    })
})

router.post('/walkind', auth.required, (req, res, next) => {
    console.log(req.body.queue)
    QueueSchema.findOne({ownerID: req.user.id, name: 'Walk In'}, (err, doc) => {
        if (err) {
            return res.status(500)
        }
        doc.queue = req.body.queue.queue
        console.log(doc.queue)
        return doc.save()
            .then(() => {
                return res.json(doc)
            })
    })
})

module.exports = router
