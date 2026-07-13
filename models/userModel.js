const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        maxlength: 25
    },
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 25,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar:{
        type: String,
        default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
    },
    bio: {
        type: String, 
        default: '',
        maxlength: 150
    },
    pronouns: {type: String, default: ''},
    website: {type: String, default: ''},
    followers: [{type: mongoose.Types.ObjectId, ref: 'user'}],
    following: [{type: mongoose.Types.ObjectId, ref: 'user'}],
    saved: [{type: mongoose.Types.ObjectId, ref: 'post'}],
    blockedUsers: [{type: mongoose.Types.ObjectId, ref: 'user'}],
    closeFriends: [{type: mongoose.Types.ObjectId, ref: 'user'}],
    isPrivate: {type: Boolean, default: false},
    status: {type: String, enum: ['active', 'deactivated', 'suspended'], default: 'active'},
    lastActive: {type: Date, default: Date.now}
}, {
    timestamps: true
})

userSchema.index({ lastActive: -1 })
userSchema.index({ username: 'text', fullname: 'text' })


module.exports = mongoose.model('user', userSchema)