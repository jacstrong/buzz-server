const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const history = require('connect-history-api-fallback');

// Initialize environment variables
const dotenv = require('dotenv');
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(cors());
app.use(logger('[:date[clf]] :method :url :status :response-time ms - :res[content-length]'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
// app.use(history()); // Was causing problems with GET requests


// MongoDB Stuff
if (isProduction) {
  mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
} else {
  mongoose.connect('mongodb://localhost:27017/buzz', { useNewUrlParser: true });
}
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // console.log('DB connection successful');
});

// Models & routes
require('./models/userSchema')
require('./models/adminSchema')
require('./models/emailConfirmationSchema')
require('./models/passwordConfSchema')
require('./models/userSettingsSchema')
require('./models/queueSchema')
require('./models/contactSchema')

// Custom Middleware
require('./middleware/passport');




if (!isProduction) {
  // app.use((err, req, res) => {
  //   // res.status(err.status || 500);
  //   // res.status(err.status || 500);

  //   res.json({
  //     errors: {
  //       message: err.message,
  //       error: err
  //     }
  //   });
  // });
}

app.use(require('./routes'));


app.use(function(err, req, res, next) {
  if (err.message === 'invalid_token') {
    return next(createError(501));
  }
});

app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({error: { message: 'user not authorized' } });
  }
});

app.use(function(err, req, res, next) {
  if (err.name === 'permission_denied') {
    res.status(403).json({error: { message: 'forbidden' } });
  }
});

// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
  // next(createError(404));
  return res.json({one: "two"})
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log(err.message)
  console.log(err)
  // console.trace("Here")
  res.status(err.status || 500).send();
});

module.exports = app;
