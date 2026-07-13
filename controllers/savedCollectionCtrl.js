const SavedCollections = require('../models/savedCollectionModel')
const Posts = require('../models/postModel')

const savedCollectionCtrl = {
    createCollection: async (req, res) => {
        try {
            const { name } = req.body
            if (!name || !name.trim()) {
                return res.status(400).json({ msg: "Collection name is required." })
            }

            const existing = await SavedCollections.findOne({ user: req.user._id, name: name.trim() })
            if (existing) {
                return res.status(400).json({ msg: "A collection with this name already exists." })
            }

            const newCollection = new SavedCollections({
                user: req.user._id,
                name: name.trim()
            })
            await newCollection.save()

            res.json({ msg: "Collection created!", collection: newCollection })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getCollections: async (req, res) => {
        try {
            const collections = await SavedCollections.find({ user: req.user._id })
                .sort('-updatedAt')
                .populate({
                    path: 'posts',
                    options: { limit: 4 },
                    select: 'images',
                    populate: { path: 'user', select: 'avatar username' }
                })

            res.json({ collections, result: collections.length })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getCollection: async (req, res) => {
        try {
            const collection = await SavedCollections.findOne({
                _id: req.params.id,
                user: req.user._id
            }).populate({
                path: 'posts',
                populate: [
                    { path: 'user', select: 'avatar username fullname' },
                    { path: 'likes', select: 'avatar username fullname' },
                    { path: 'comments', populate: { path: 'user', select: 'avatar username fullname' } }
                ]
            })

            if (!collection) return res.status(404).json({ msg: "Collection not found." })

            res.json({ collection })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    addToCollection: async (req, res) => {
        try {
            const { postId } = req.body
            const collection = await SavedCollections.findOne({
                _id: req.params.id,
                user: req.user._id
            })

            if (!collection) return res.status(404).json({ msg: "Collection not found." })

            if (collection.posts.includes(postId)) {
                return res.status(400).json({ msg: "Post already in this collection." })
            }

            collection.posts.push(postId)
            if (!collection.cover && postId) {
                const post = await Posts.findById(postId)
                if (post && post.images && post.images.length > 0) {
                    collection.cover = post.images[0].url
                }
            }
            await collection.save()

            res.json({ msg: "Post added to collection!", collection })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    removeFromCollection: async (req, res) => {
        try {
            const { postId } = req.body
            const collection = await SavedCollections.findOne({
                _id: req.params.id,
                user: req.user._id
            })

            if (!collection) return res.status(404).json({ msg: "Collection not found." })

            collection.posts = collection.posts.filter(p => p.toString() !== postId)
            await collection.save()

            res.json({ msg: "Post removed from collection!", collection })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    updateCollection: async (req, res) => {
        try {
            const { name } = req.body
            const collection = await SavedCollections.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                { name: name.trim() },
                { new: true }
            )

            if (!collection) return res.status(404).json({ msg: "Collection not found." })

            res.json({ msg: "Collection updated!", collection })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    deleteCollection: async (req, res) => {
        try {
            const collection = await SavedCollections.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            })

            if (!collection) return res.status(404).json({ msg: "Collection not found." })

            res.json({ msg: "Collection deleted!" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = savedCollectionCtrl
