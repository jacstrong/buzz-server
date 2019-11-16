const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.status(200).send('it works');
})

router.use('/api', require('./api'));

module.exports = router;
