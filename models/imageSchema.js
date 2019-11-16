const mongoose = require('mongoose');
const fs = require('fs')
const path = require('path')
const appRoot = require('app-root-path');
const hasha = require('hasha') // TODO: Do this yourself
const axios = require('axios')



const ImageSchema = mongoose.Schema({
  // altText: { type: String, required: true },
  bbID: { type: String, required: [true, 'Back Blaze ID is required'] },
  checksum: { type: String, required: [true, 'Checksum is required'] },
  mime: { type: String, required: [true, 'Mime type is required'] },
  bbName: { type: String, required: [true, 'Back Blaze name is required'] },
  name: { type: String, required: [true, 'Name is required'] },
  size: { type: Number, required: [true, 'Size is required'] },
  parentItemID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreItemSchema',
  },
  generateDate: { type: Date, required: [true, 'Date generated is required'] }
})

ImageSchema.methods.uploadImage = async function (file, callback) {
  const filePath = path.join(appRoot.toString(), file.path)
  console.log(`1: Image upload called`)
  const sha = await getChecksum(filePath)
  const url = getUploadUrl(async (error, url) => {
    if (error) return
    console.log('test')
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(err)
        return
      }
      console.log(`3: Data has been read`)
      axios.request({
        url: url.url,
        method: 'post',
        headers: {
          'Authorization' : url.auth,
          'X-Bz-File-Name' : 'images/' + file.filename,
          'Content-Length' : file.size,
          'Content-Type' : file.mimetype,
          'X-Bz-Content-Sha1' : sha
        },
        data: data
      })
      .then(response => {
        console.log(`4: Image successfully sent to B2`)
          console.log(response.data)
          this.mime = file.mimetype
          this.size = file.size
          this.name = file.originalname
          this.bbName = file.filename
          this.checksum = sha
          this.generateDate = new Date()
          this.bbID = response.data.fileId
          deleteFile(filePath, () => {
            callback(false)
          })
        })
        .catch(error => {
          console.log('Axios Error'.bgYellow.black)
          console.log('^^^' + file.originalname)
          console.log('^^^' + filePath)
          console.log(error.response.data)
          deleteFile(filePath, () => {
            callback(true)
          })
      })
    })
  })
}

ImageSchema.methods.deleteImage = async function (callback) {
  axios.request({
    method: 'post',
    url: `${process.env.B2_API_URL}/b2api/v2/b2_delete_file_version`,
    headers: {
      'Authorization' : process.env.B2_AUTH
    },
    data: {
      fileId: this.bbID,
      fileName: 'images/' + this.bbName
    }
  })
    .then(response => {
      console.log(response.data)
      callback(false)
    })
    .catch(error => {
      console.log(error.response.data)
      callback(true)
    })
}

deleteFile = async function (filePath, callback) {
  console.log('***' + filePath)
  fs.unlink(filePath, () => {
    callback()
  })
}

getChecksum = async function (filePath) {
  const sha = await hasha.fromFile(filePath, {algorithm: 'sha1'});
  console.log(`2: Checksum=${sha}`)
  return sha
}

getUploadUrl = (callback) => {
  console.log('Getting B2 Upload URL & token'.yellow)

  axios.request({
    url: `${process.env.B2_API_URL}/b2api/v2/b2_get_upload_url`,
    method: 'post',
    headers: {
      Authorization: process.env.B2_AUTH
    },
    data: {
      bucketId: process.env.B2_BUCKET
    }
  })
    .then(response => {
      const url = {
        url: response.data.uploadUrl,
        auth: response.data.authorizationToken
      } 
      
      callback(false, url)
    })
    .catch(error => {
      console.log(error)
      callback(false, error)
    })

  // -H 'Authorization: ACCOUNT_AUTHORIZATION_TOKEN' \
  //   -d '{"bucketId": "BUCKET_ID"}' \
  //   https://apiNNN.backblazeb2.com/b2api/v2/b2_get_upload_url
}

module.exports = mongoose.model('ImageSchema', ImageSchema);
