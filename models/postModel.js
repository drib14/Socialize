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
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    tags: [{ type: String, lowercase: true, trim: true }],
    location: { type: String, default: '' },
    mood: { type: String, default: '' }
}, {
    timestamps: true
})

postSchema.index({ user: 1, createdAt: -1 })
postSchema.index({ createdAt: -1 })
postSchema.index({ tags: 1 })

module.exports = mongoose.model('post', postSchema)