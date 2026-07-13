const Highlights = require('../models/highlightModel')

const highlightCtrl = {
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

            res.json({ msg: "Highlight created!", highlight: newHighlight })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getHighlights: async (req, res) => {
        try {
            const userId = req.params.id || req.user._id
            const highlights = await Highlights.find({ user: userId })
                .sort('createdAt')
                .populate({
                    path: 'moments',
                    options: { limit: 1 },
                    select: 'media resource_type caption createdAt'
                })

            res.json({ highlights, result: highlights.length })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getHighlight: async (req, res) => {
        try {
            const highlight = await Highlights.findById(req.params.id)
                .populate({
                    path: 'moments',
                    populate: { path: 'user', select: 'avatar username fullname' }
                })

            if (!highlight) return res.status(404).json({ msg: "Highlight not found." })

            res.json({ highlight })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    addMomentToHighlight: async (req, res) => {
        try {
            const { momentId } = req.body
            const highlight = await Highlights.findOne({
                _id: req.params.id,
                user: req.user._id
            })

            if (!highlight) return res.status(404).json({ msg: "Highlight not found." })

            if (highlight.moments.map(m => m.toString()).includes(momentId)) {
                return res.status(400).json({ msg: "Story already in this highlight." })
            }

            highlight.moments.push(momentId)
            await highlight.save()

            res.json({ msg: "Story added to highlight!", highlight })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    removeMomentFromHighlight: async (req, res) => {
        try {
            const { momentId } = req.body
            const highlight = await Highlights.findOne({
                _id: req.params.id,
                user: req.user._id
            })

            if (!highlight) return res.status(404).json({ msg: "Highlight not found." })

            highlight.moments = highlight.moments.filter(m => m.toString() !== momentId)
            await highlight.save()

            res.json({ msg: "Story removed from highlight!", highlight })
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

            const highlight = await Highlights.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                updateData,
                { new: true }
            )

            if (!highlight) return res.status(404).json({ msg: "Highlight not found." })

            res.json({ msg: "Highlight updated!", highlight })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    deleteHighlight: async (req, res) => {
        try {
            const highlight = await Highlights.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            })

            if (!highlight) return res.status(404).json({ msg: "Highlight not found." })

            res.json({ msg: "Highlight deleted!" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = highlightCtrl
