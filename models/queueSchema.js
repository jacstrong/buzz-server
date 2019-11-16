const mongoose = require('mongoose');

const states = ['Waiting', 'Notified']

const QueueSchema = mongoose.Schema({
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSchema',
        required: [true, 'Contact must be connected to a user']
    },
    queue: [{
        contactID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ContactSchema',
        },
        name: { type: String, required: [true, 'Customer name is required']},
        state: { type: String, enum: states, required: [true, 'Must have a state']},
        timeStamp: { type: Date, required: [true, 'Must have a timestamp']},
        partyNum: { type: Number}
    }],
    name: { type: String, enum: ['Walk In', 'Reservation'], required: [true, 'A queue must have a name']},
})

module.exports = mongoose.model('QueueSchema', QueueSchema);
