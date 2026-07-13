const mongoose = require('mongoose')

const momentSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    media: { type: String, required: true },
    resource_type: { type: String, enum: ['image', 'video'], default: 'image' },
    caption: { type: String, default: '' },
    post: { type: mongoose.Types.ObjectId, ref: 'post' },
    views: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'followers' },
    closeFriendsOnly: { type: Boolean, default: false },
    poll: {
        question: { type: String, default: '' },
        options: [{
            text: { type: String, required: true },
            votes: [{ type: mongoose.Types.ObjectId, ref: 'user' }]
        }]
    },
    createdAt: { type: Date, default: Date.now }
})

momentSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('moment', momentSchema)
