const mongoose = require('mongoose')

const followRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    recipient: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    }
}, {
    timestamps: true
})

followRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true })

module.exports = mongoose.model('followRequest', followRequestSchema)
