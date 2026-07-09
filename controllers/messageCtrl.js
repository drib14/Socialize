const Conversations = require('../models/conversationModel')
const Messages = require('../models/messageModel')

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

const messageCtrl = {
    createMessage: async (req, res) => {
        try {
            const { sender, recipient, text, media, call, replyTo } = req.body

            if(!recipient || (!text.trim() && media.length === 0 && !call)) return;

            const newConversation = await Conversations.findOneAndUpdate({
                $or: [
                    {recipients: [sender, recipient]},
                    {recipients: [recipient, sender]}
                ]
            }, {
                recipients: [sender, recipient],
                text, media, call
            }, { new: true, upsert: true })

            const newMessage = new Messages({
                conversation: newConversation._id,
                sender, call,
                recipient, text, media, replyTo
            })

            await newMessage.save()

            res.json({msg: 'Create Success!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getConversations: async (req, res) => {
        try {
            const features = new APIfeatures(Conversations.find({
                recipients: req.user._id
            }), req.query).paginating()

            const conversations = await features.query.sort('-updatedAt')
            .populate('recipients', 'avatar username fullname lastActive')

            res.json({
                conversations,
                result: conversations.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getMessages: async (req, res) => {
        try {
            const features = new APIfeatures(Messages.find({
                $or: [
                    {sender: req.user._id, recipient: req.params.id},
                    {sender: req.params.id, recipient: req.user._id}
                ]
            }), req.query).paginating()

            const messages = await features.query.sort('-createdAt')
            .populate('replyTo')

            res.json({
                messages,
                result: messages.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteMessages: async (req, res) => {
        try {
            await Messages.findOneAndDelete({_id: req.params.id, sender: req.user._id})
            res.json({msg: 'Delete Success!'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteConversation: async (req, res) => {
        try {
            const newConver = await Conversations.findOneAndDelete({
                $or: [
                    {recipients: [req.user._id, req.params.id]},
                    {recipients: [req.params.id, req.user._id]}
                ]
            })
            await Messages.deleteMany({conversation: newConver._id})
            
            res.json({msg: 'Delete Success!'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateMessage: async (req, res) => {
        try {
            const { text } = req.body;
            const updated = await Messages.findOneAndUpdate(
                { _id: req.params.id, sender: req.user._id }, 
                { text },
                { new: true }
            ).populate('replyTo');
            
            res.json({ msg: 'Update Success!', message: updated })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    reactMessage: async (req, res) => {
        try {
            const { emoji } = req.body;
            const message = await Messages.findById(req.params.id);
            if(!message) return res.status(400).json({msg: 'Message does not exist.'});

            let reactions = message.reactions || [];
            const index = reactions.findIndex(r => r.user.toString() === req.user._id.toString());
            
            if (index > -1) {
                if (reactions[index].emoji === emoji) {
                    reactions.splice(index, 1);
                } else {
                    reactions[index].emoji = emoji;
                }
            } else {
                reactions.push({ user: req.user._id, emoji });
            }

            const updated = await Messages.findByIdAndUpdate(req.params.id, { reactions }, { new: true })
            .populate('replyTo');

            res.json({ msg: 'Reacted success!', reactions: updated.reactions });
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    }
}


module.exports = messageCtrl