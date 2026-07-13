const Moments = require('../models/momentModel')

const momentCtrl = {
    createMoment: async (req, res) => {
        try {
            const { media, resource_type, caption, visibility, post } = req.body
            if (!media && !post) return res.status(400).json({ msg: "Please add your media or share a post." })

            const newMoment = new Moments({
                user: req.user._id,
                media: media || '',
                resource_type: resource_type || 'image',
                caption: caption || '',
                visibility: visibility || 'followers',
                post: post || undefined
            })

            await newMoment.save()
            const populated = await newMoment.populate([
                { path: 'user', select: 'username fullname avatar' },
                { path: 'post', populate: { path: 'user', select: 'username fullname avatar' } }
            ])

            res.json({
                msg: 'Moment Created!',
                newMoment: populated
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getMoments: async (req, res) => {
        try {
            const myAndFollowingIds = [...req.user.following, req.user._id]
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

            // Fetch active moments for self and followed users
            const activeMoments = await Moments.find({
                user: { $in: myAndFollowingIds },
                createdAt: { $gte: twentyFourHoursAgo }
            }).populate('user', 'username fullname avatar')
              .populate('views', 'username fullname avatar')
              .populate({
                  path: 'post',
                  populate: {
                      path: 'user',
                      select: 'username fullname avatar'
                  }
              })
              .sort('-createdAt')

            // Group by user id under visibility gates
            const grouped = {}
            activeMoments.forEach(moment => {
                if (!moment.user) return;
                
                // Enforce visibility gate for other users
                const authorId = moment.user._id.toString();
                if (authorId !== req.user._id.toString()) {
                    if (moment.visibility === 'private') return; // hide private stories of others
                }

                const userId = moment.user._id.toString()
                if (!grouped[userId]) {
                    grouped[userId] = {
                        user: moment.user,
                        moments: []
                    }
                }
                grouped[userId].moments.push(moment)
            })

            let result = Object.values(grouped)

            // Prioritize the current user's moments at index 0
            const myIdStr = req.user._id.toString()
            const myIndex = result.findIndex(item => item.user._id.toString() === myIdStr)
            if (myIndex > -1) {
                const myMoments = result.splice(myIndex, 1)[0]
                result.unshift(myMoments)
            }

            res.json({ moments: result })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getMomentsArchive: async (req, res) => {
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            // Fetch moments for the logged in user created more than 24 hours ago
            const archivedMoments = await Moments.find({
                user: req.user._id,
                createdAt: { $lt: twentyFourHoursAgo }
            }).populate('user', 'username fullname avatar')
              .populate('views', 'username fullname avatar')
              .populate({
                  path: 'post',
                  populate: {
                      path: 'user',
                      select: 'username fullname avatar'
                  }
              })
              .sort('-createdAt')

            res.json({ archivedMoments })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    viewMoment: async (req, res) => {
        try {
            await Moments.findOneAndUpdate(
                { _id: req.params.id },
                { $addToSet: { views: req.user._id } },
                { new: true }
            )
            res.json({ msg: 'Moment marked as viewed.' })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    deleteMoment: async (req, res) => {
        try {
            const moment = await Moments.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            })
            if (!moment) return res.status(400).json({ msg: "Moment not found or unauthorized." })
            res.json({ msg: 'Moment deleted.' })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = momentCtrl
