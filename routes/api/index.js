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
router.use('/marketing', require('./marketing/marketing'))

module.exports = router;
