const Notifies = require('../models/notifyModel')


const notifyCtrl = {
    createNotify: async (req, res) => {
        try {
            const { id, recipients, url, text, content, image } = req.body

            if(recipients.includes(req.user._id.toString())) return;

            // Find an existing unread notification for this target action to aggregate it
            const existing = await Notifies.findOne({ id, url, text, isRead: false })

            if (existing) {
                if (!existing.actors.includes(req.user._id)) {
                    existing.actors.push(req.user._id)
                }
                existing.user = req.user._id // Set latest actor
                existing.image = image
                existing.content = content
                await existing.save()
                return res.json({ notify: existing })
            }

            const notify = new Notifies({
                id, recipients, url, text, content, image, user: req.user._id, actors: [req.user._id]
            })

            await notify.save()
            return res.json({notify})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    removeNotify: async (req, res) => {
        try {
            const notify = await Notifies.findOne({
                id: req.params.id, url: req.query.url
            })

            if (notify) {
                notify.actors = notify.actors.filter(actor => actor.toString() !== req.user._id.toString())
                if (notify.actors.length === 0) {
                    await Notifies.findOneAndDelete({ _id: notify._id })
                } else {
                    notify.user = notify.actors[notify.actors.length - 1] // Roll back latest actor
                    await notify.save()
                }
            }
            
            return res.json({notify})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getNotifies: async (req, res) => {
        try {
            const notifies = await Notifies.find({recipients: req.user._id})
            .sort('-createdAt')
            .populate('user', 'avatar username')
            .populate('actors', 'avatar username')
            
            return res.json({notifies})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    isReadNotify: async (req, res) => {
        try {
            const notifies = await Notifies.findOneAndUpdate({_id: req.params.id}, {
                isRead: true
            })

            return res.json({notifies})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteAllNotifies: async (req, res) => {
        try {
            const notifies = await Notifies.deleteMany({recipients: req.user._id})
            
            return res.json({notifies})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}


module.exports = notifyCtrl