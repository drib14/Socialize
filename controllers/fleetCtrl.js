const Highlights = require('../models/fleetModel')

const fleetCtrl = {
    createHighlight: async (req, res) => {
        try {
            const { title, cover, moments } = req.body
            if (!title || !title.trim()) {
                return res.status(400).json({ msg: "Highlight title is required." })
            }

            const newHighlight = new Highlights({
                user: req.user._id,
                title: title.trim(),
                cover: cover || '',
                moments: moments || []
            })
            await newHighlight.save()

            res.json({ msg: "Highlight created!", fleet: newHighlight })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getHighlights: async (req, res) => {
        try {
            const userId = req.params.id || req.user._id
            const fleets = await Highlights.find({ user: userId })
                .sort('createdAt')
                .populate({
                    path: 'moments',
                    options: { limit: 1 },
                    select: 'media resource_type caption createdAt'
                })

            res.json({ fleets, result: fleets.length })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getHighlight: async (req, res) => {
        try {
            const fleet = await Highlights.findById(req.params.id)
                .populate({
                    path: 'moments',
                    populate: { path: 'user', select: 'avatar username fullname' }
                })

            if (!fleet) return res.status(404).json({ msg: "Highlight not found." })

            res.json({ fleet })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    addMomentToHighlight: async (req, res) => {
        try {
            const { momentId } = req.body
            const fleet = await Highlights.findOne({
                _id: req.params.id,
                user: req.user._id
            })

            if (!fleet) return res.status(404).json({ msg: "Highlight not found." })

            if (fleet.moments.map(m => m.toString()).includes(momentId)) {
                return res.status(400).json({ msg: "Story already in this fleet." })
            }

            fleet.moments.push(momentId)
            await fleet.save()

            res.json({ msg: "Story added to fleet!", fleet })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    removeMomentFromHighlight: async (req, res) => {
        try {
            const { momentId } = req.body
            const fleet = await Highlights.findOne({
                _id: req.params.id,
                user: req.user._id
            })

            if (!fleet) return res.status(404).json({ msg: "Highlight not found." })

            fleet.moments = fleet.moments.filter(m => m.toString() !== momentId)
            await fleet.save()

            res.json({ msg: "Story removed from fleet!", fleet })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    updateHighlight: async (req, res) => {
        try {
            const { title, cover } = req.body
            const updateData = {}
            if (title) updateData.title = title.trim()
            if (cover !== undefined) updateData.cover = cover

            const fleet = await Highlights.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                updateData,
                { new: true }
            )

            if (!fleet) return res.status(404).json({ msg: "Highlight not found." })

            res.json({ msg: "Highlight updated!", fleet })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    deleteHighlight: async (req, res) => {
        try {
            const fleet = await Highlights.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            })

            if (!fleet) return res.status(404).json({ msg: "Highlight not found." })

            res.json({ msg: "Highlight deleted!" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = fleetCtrl
