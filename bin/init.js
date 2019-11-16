// This file runs when the program is run and makes sure that there is at least one admin account

const mongoose = require('mongoose')
const axios = require('axios')
const colors = require('colors')
const AdminSchema = mongoose.model('AdminSchema')
const crypto = require('crypto')

if (process.env.NODE_ENV === 'dev') {
  require('dotenv').load()
}

// getUploadUrlB2 = () => {
//   console.log('Getting B2 Upload URL & token'.yellow)

//   axios.request({
//     url: `${process.env.B2_API_URL}/b2api/v2/b2_get_upload_url`,
//     method: 'post',
//     headers: {
//       Authorization: process.env.B2_AUTH
//     },
//     data: {
//       bucketId: process.env.B2_BUCKET
//     }
//   })
//     .then(response => {
//       process.env.B2_UPLOAD_URL = response.data.uploadUrl
//       process.env.B2_UPLOAD_AUTH = response.data.authorizationToken
//       console.log('B2 upload url & token gotten!'.yellow)
//       console.log('Will call B2 for url & token again in 23 hours'.yellow)
//       setTimeout(setupB2, 1000 * 60 * 60 * 23)
//     })
//     .catch(error => {
//       console.log(error)
//       console.log('Error getting the B2 upload url & token'.bold.red)
//     })
// }

const generateSecret = function (req, res, next) {
  crypto.randomBytes(256, function(ex, buf) {
    if (ex) throw ex;
    process.env.SECRET = buf
  });
}

const checkNoAdmin = function (callback) {
  AdminSchema.countDocuments(function (err, count) {
    console.log('There are %d admins'.cyan, count)
    if (count <= 0) {
      let data = {
        email: 'ja.ha.strong@gmail.com',
        active: true,
        createDate: new Date(),
        lastLogin: new Date(),
        name: 'admin'
      }
      let admin = new AdminSchema(data)
      admin.setPassword('thebestbadger')
      admin.save((err, res) => {
        if (err) {
          console.log('there was an error')
          console.log(err)
        } else {
          console.log('A new admin was created\nemail: ja.ha.strong@gmail.com\np: thebestbadger'.cyan)
        }
        callback()
      })
    } else {
      callback()
    }
  })
}

const setupB2 = function (callback) {
  console.log('Getting B2 API URL'.yellow)
  const tok = `${process.env.B2_KEY_ID}:${process.env.B2_KEY}`
  const hash = Buffer.from(tok).toString('base64')
  const Basic = 'Basic ' + hash;

  axios.request({
    url: `https://api.backblazeb2.com/b2api/v2/b2_authorize_account`,
    method: 'get',
    headers: {
      'Authorization' : Basic
    }
  })
    .then(response => {
      process.env.B2_AUTH = response.data.authorizationToken
      process.env.B2_API_URL = response.data.apiUrl
      process.env.B2_DOWN_URL = response.data.downloadUrl
      if (callback) {
        checkNoAdmin(callback)
      }
    })
    .catch(error => {
      console.log(error.response.data)
      console.log(error.config)
      console.log('Unable to establish connection to BackBlaze API.\nExiting')
      process.exit(1)
    })
}

const init = function (callback) {
  generateSecret()
  setupB2(callback)
  setInterval(setupB2, 1000 * 60 * 60 * 23)
}

module.exports = {
  init
}
