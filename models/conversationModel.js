const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
    recipients: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    text: String,
    media: Array,
    call: Object,
    name: { type: String, default: '' },
    isGroup: { type: Boolean, default: false },
    admin: { type: mongoose.Types.ObjectId, ref: 'user' }
}, {
    timestamps: true
})

conversationSchema.index({ recipients: 1, updatedAt: -1 })

module.exports = mongoose.model('conversation', conversationSchema)