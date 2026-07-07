const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    content: String,
    images: {
        type: Array
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'comment' }],
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    repostOf: {type: mongoose.Types.ObjectId, ref: 'post'}
}, {
    timestamps: true
})

module.exports = mongoose.model('post', postSchema)