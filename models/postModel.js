const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    content: String,
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        resource_type: { type: String, enum: ['image', 'video'], default: 'image' }
    }],
    likes: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'comment' }],
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    repostOf: {type: mongoose.Types.ObjectId, ref: 'post'},
    tags: [{ type: String, lowercase: true, trim: true }],
    taggedUsers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    location: { type: String, default: '' },
    altText: { type: String, default: '' },
    views: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    isPinned: { type: Boolean, default: false },
    commentsDisabled: { type: Boolean, default: false },
    hideLikeCounts: { type: Boolean, default: false },
    isReel: { type: Boolean, default: false },
    audioTrack: {
        title: { type: String, default: 'Original Audio' },
        artist: { type: String, default: '' }
    }
}, {
    timestamps: true
})

postSchema.index({ user: 1, createdAt: -1 })
postSchema.index({ createdAt: -1 })
postSchema.index({ tags: 1 })
postSchema.index({ taggedUsers: 1 })

module.exports = mongoose.model('post', postSchema)