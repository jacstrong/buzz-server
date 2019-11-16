const mongoose = require('mongoose');

const states = ['Waiting', 'Notified']

const ContactSchema = mongoose.Schema({
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSchema',
        required: [true, 'Contact must be connected to a user']
    },
    name: { type: String, required: [true, 'Contact must have a name']},
    phoneNumber: { type: String, required: [true, 'Contact must have a phone number']},
    wantsMarketing: { type: Boolean, default: false, required: [true, 'Marketing state must be set']}
})

module.exports = mongoose.model('ContactSchema', ContactSchema);
