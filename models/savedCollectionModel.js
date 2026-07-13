const mongoose = require('mongoose')

const savedCollectionSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    cover: { type: String, default: '' },
    posts: [{ type: mongoose.Types.ObjectId, ref: 'post' }]
}, {
    timestamps: true
})

savedCollectionSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('savedCollection', savedCollectionSchema)
