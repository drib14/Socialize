const mongoose = require('mongoose')

const notifySchema = new mongoose.Schema({
    id: mongoose.Types.ObjectId,
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    actors: [{type: mongoose.Types.ObjectId, ref: 'user'}],
    recipients: [mongoose.Types.ObjectId],
    url: String,
    text: String,
    content: String,
    image: String,
    isRead: {type: Boolean, default: false}
}, {
    timestamps: true
})

notifySchema.index({ recipients: 1, createdAt: -1 })
notifySchema.index({ id: 1, url: 1 })

module.exports = mongoose.model('notify', notifySchema)