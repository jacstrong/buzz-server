const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
  res.status(200).send('it works')
})

router.use('/user', require('./user/user'))
router.use('/admin', require('./admin/admin'))

module.exports = router;
