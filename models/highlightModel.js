const mongoose = require('mongoose')

const highlightSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: true, trim: true, maxlength: 30 },
    cover: { type: String, default: '' },
    moments: [{ type: mongoose.Types.ObjectId, ref: 'moment' }]
}, {
    timestamps: true
})

highlightSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('highlight', highlightSchema)
