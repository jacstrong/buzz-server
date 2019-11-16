const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
  res.status(200).send('it works')
})

router.use('/user', require('./user/user'))
router.use('/admin', require('./admin/admin'))
router.use('/queue', require('./queue/queue'))
router.use('/contact', require('./contact/contact'))
router.use('/notify', require('./notify/notify'))
<<<<<<< HEAD
router.use('/reservations', require('./reservations/reservations'))
=======
router.use('/marketing', require('./marketing/marketing'))
>>>>>>> 7e77aa8762b40f5b9ad72bcebde4c81bcc44b37b

module.exports = router;
