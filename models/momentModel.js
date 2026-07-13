const mongoose = require('mongoose')

const momentSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    media: { type: String, required: true },
    resource_type: { type: String, enum: ['image', 'video'], default: 'image' },
    caption: { type: String, default: '' },
    views: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('moment', momentSchema)
