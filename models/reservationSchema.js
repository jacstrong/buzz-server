const mongoose = require('mongoose');

const states = ['Waiting', 'Notified']

const ReservationSchema = mongoose.Schema({
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSchema',
        required: [true, 'Contact must be connected to a user']
    },
    contactID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContactSchema',
        required: [true, 'Contact must be connected to a user']
    },
    name: { type: String, required: [true, 'Reservation must have a name']},
    phoneNumber: { type: String, required: [true, 'Reservation must have a phone number']},
    date: { type: String, required: [true, 'Reservation must have a date']},
    time: { type: String, required: [true, 'Reservation must have a time']},
})

module.exports = mongoose.model('ReservationSchema', ReservationSchema);
