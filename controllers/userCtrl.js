const Users = require('../models/userModel')
const FollowRequests = require('../models/followRequestModel')

const userCtrl = {
    searchUser: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10
            const queryStr = req.query.username || ''
            
            let query = {}
            if (queryStr) {
                query = {
                    $text: { $search: queryStr },
                    _id: { $ne: req.user._id },
                    blockedUsers: { $ne: req.user._id }
                }
            } else {
                query = {
                    _id: { $ne: req.user._id },
                    blockedUsers: { $ne: req.user._id }
                }
            }

            let users = await Users.find(query)
                .select("fullname username avatar lastActive")
                .limit(limit)

            if (users.length === 0 && queryStr) {
                users = await Users.find({
                    username: { $regex: queryStr, $options: 'i' },
                    _id: { $ne: req.user._id },
                    blockedUsers: { $ne: req.user._id }
                })
                .select("fullname username avatar lastActive")
                .limit(limit)
            }

            const myId = req.user._id.toString()
            users = users.filter(user => {
                const blockedList = user.blockedUsers || []
                return !blockedList.some(id => id.toString() === myId)
            })

            res.json({users})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.params.id).select('-password')
                .populate("followers following", "-password")
            
            if(!user) return res.status(404).json({msg: "User does not exist."})

            const myId = req.user._id.toString()
            const targetId = user._id.toString()
            const myProfile = await Users.findById(req.user._id)
            
            if (
                myProfile.blockedUsers.some(id => id.toString() === targetId) ||
                user.blockedUsers.some(id => id.toString() === myId)
            ) {
                return res.status(403).json({msg: "You do not have permission to view this profile."})
            }

            const isPendingRequest = await FollowRequests.exists({ sender: req.user._id, recipient: user._id, status: 'pending' })
            const isBlockedByMe = myProfile.blockedUsers.some(id => id.toString() === targetId)

            const userObj = {
                ...user._doc,
                isPendingRequest: !!isPendingRequest,
                isBlockedByMe: !!isBlockedByMe
            }

            res.json({user: userObj})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUser: async (req, res) => {
        try {
            const { avatar, fullname, mobile, address, story, website, gender, isPrivate } = req.body
            if(!fullname) return res.status(400).json({msg: "Please add your full name."})

            await Users.findOneAndUpdate({_id: req.user._id}, {
                avatar, fullname, mobile, address, story, website, gender, isPrivate
            })

            res.json({msg: "Update Success!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    follow: async (req, res) => {
        try {
            const targetUser = await Users.findById(req.params.id)
            if(!targetUser) return res.status(404).json({msg: "User not found."})

            const myId = req.user._id.toString()
            const targetId = targetUser._id.toString()

            const myProfile = await Users.findById(req.user._id)
            if (
                myProfile.blockedUsers.some(id => id.toString() === targetId) ||
                targetUser.blockedUsers.some(id => id.toString() === myId)
            ) {
                return res.status(403).json({msg: "Action blocked by security preferences."})
            }

            if (targetUser.followers.some(id => id.toString() === myId)) {
                return res.status(400).json({msg: "You already follow this user."})
            }

            if (targetUser.isPrivate) {
                const existingRequest = await FollowRequests.findOne({ sender: req.user._id, recipient: req.params.id })
                if (existingRequest) {
                    return res.status(400).json({msg: "Follow request is already pending.", status: 'pending'})
                }

                const newRequest = new FollowRequests({
                    sender: req.user._id,
                    recipient: req.params.id
                })
                await newRequest.save()

                return res.json({msg: "Follow request sent.", status: 'pending'})
            }

            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, { 
                $addToSet: {followers: req.user._id}
            }, {new: true}).populate("followers following", "-password")

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $addToSet: {following: req.params.id}
            }, {new: true})

            res.json({newUser, status: 'following'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unfollow: async (req, res) => {
        try {
            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, { 
                $pull: {followers: req.user._id}
            }, {new: true}).populate("followers following", "-password")

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {following: req.params.id}
            }, {new: true})

            await FollowRequests.deleteMany({
                $or: [
                    { sender: req.user._id, recipient: req.params.id },
                    { sender: req.params.id, recipient: req.user._id }
                ]
            })

            res.json({newUser, status: 'unfollowed'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    blockUser: async (req, res) => {
        try {
            const targetId = req.params.id
            if (targetId === req.user._id.toString()) {
                return res.status(400).json({msg: "You cannot block yourself."})
            }

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {followers: targetId, following: targetId},
                $addToSet: {blockedUsers: targetId}
            })

            await Users.findOneAndUpdate({_id: targetId}, {
                $pull: {followers: req.user._id, following: req.user._id}
            })

            await FollowRequests.deleteMany({
                $or: [
                    { sender: req.user._id, recipient: targetId },
                    { sender: targetId, recipient: req.user._id }
                ]
            })

            res.json({msg: "User successfully blocked."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unblockUser: async (req, res) => {
        try {
            const targetId = req.params.id
            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {blockedUsers: targetId}
            })
            res.json({msg: "User successfully unblocked."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getFollowRequests: async (req, res) => {
        try {
            const requests = await FollowRequests.find({ recipient: req.user._id, status: 'pending' })
                .populate('sender', 'avatar username fullname')
            res.json({requests})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    acceptFollowRequest: async (req, res) => {
        try {
            const request = await FollowRequests.findById(req.params.id)
            if(!request) return res.status(404).json({msg: "Request not found."})

            const senderId = request.sender
            const recipientId = request.recipient

            const myProfile = await Users.findById(recipientId)
            const senderProfile = await Users.findById(senderId)
            if (
                myProfile.blockedUsers.some(id => id.toString() === senderId.toString()) ||
                senderProfile.blockedUsers.some(id => id.toString() === recipientId.toString())
            ) {
                await FollowRequests.findByIdAndDelete(req.params.id)
                return res.status(400).json({msg: "Cannot complete request due to blocked preferences."})
            }

            await Users.findOneAndUpdate({_id: recipientId}, {
                $addToSet: {followers: senderId}
            })

            await Users.findOneAndUpdate({_id: senderId}, {
                $addToSet: {following: recipientId}
            })

            request.status = 'accepted'
            await request.save()

            res.json({msg: "Request accepted."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    declineFollowRequest: async (req, res) => {
        try {
            await FollowRequests.findByIdAndDelete(req.params.id)
            res.json({msg: "Request declined."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    suggestionsUser: async (req, res) => {
        try {
            const myId = req.user._id
            const myFollowing = req.user.following || []
            const myBlocked = req.user.blockedUsers || []
            const excludeArr = [...myFollowing, myId, ...myBlocked]
            const num = parseInt(req.query.num) || 10

            const followingUsersProfiles = await Users.find({_id: {$in: myFollowing}}).select('following')
            const secondDegreeCandidates = []
            followingUsersProfiles.forEach(u => {
                if (u.following) {
                    u.following.forEach(fId => {
                        const idStr = fId.toString()
                        if (!excludeArr.some(eId => eId.toString() === idStr)) {
                            secondDegreeCandidates.push(idStr)
                        }
                    })
                }
            })

            const frequencyMap = {}
            secondDegreeCandidates.forEach(id => {
                frequencyMap[id] = (frequencyMap[id] || 0) + 1
            })

            const sortedIds = Object.keys(frequencyMap).sort((a, b) => frequencyMap[b] - frequencyMap[a])

            let suggestedUsers = await Users.find({_id: {$in: sortedIds.slice(0, num)}})
                .select('avatar username fullname followers following blockedUsers')

            suggestedUsers = suggestedUsers.filter(u => {
                const list = u.blockedUsers || []
                return !list.some(bId => bId.toString() === myId.toString())
            })

            if (suggestedUsers.length < num) {
                const alreadySuggested = suggestedUsers.map(u => u._id)
                const backfillNum = num - suggestedUsers.length
                
                const backfillUsers = await Users.find({
                    _id: {$nin: [...excludeArr, ...alreadySuggested]},
                    isPrivate: false,
                    blockedUsers: {$ne: myId}
                })
                .limit(backfillNum)
                .select('avatar username fullname followers following')

                suggestedUsers = [...suggestedUsers, ...backfillUsers]
            }

            return res.json({
                users: suggestedUsers,
                result: suggestedUsers.length
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserByUsername: async (req, res) => {
        try {
            const user = await Users.findOne({ username: req.params.username }).select('-password')
                .populate("followers following", "-password")
            
            if(!user) return res.status(404).json({msg: "User does not exist."})

            const myId = req.user._id.toString()
            const targetId = user._id.toString()
            const myProfile = await Users.findById(req.user._id)
            if (
                myProfile.blockedUsers.some(id => id.toString() === targetId) ||
                user.blockedUsers.some(id => id.toString() === myId)
            ) {
                return res.status(403).json({msg: "You do not have permission to view this profile."})
            }

            const isPendingRequest = await FollowRequests.exists({ sender: req.user._id, recipient: user._id, status: 'pending' })
            const isBlockedByMe = myProfile.blockedUsers.some(id => id.toString() === targetId)

            const userObj = {
                ...user._doc,
                isPendingRequest: !!isPendingRequest,
                isBlockedByMe: !!isBlockedByMe
            }

            res.json({user: userObj})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

module.exports = userCtrl