const Comments = require('../models/commentModel')
const Posts = require('../models/postModel')

const commentCtrl = {
    createComment: async (req, res) => {
        try {
            const { postId, content, tag, reply, postUserId, images } = req.body

            const post = await Posts.findById(postId)
            if(!post) return res.status(400).json({msg: "This post does not exist."})

            if(reply){
                const cm = await Comments.findById(reply)
                if(!cm) return res.status(400).json({msg: "This comment does not exist."})
            }

            const newComment = new Comments({
                user: req.user._id, content, tag, reply, postUserId, postId,
                images: images || []
            })

            await Posts.findOneAndUpdate({_id: postId}, {
                $push: {comments: newComment._id}
            }, {new: true})

            await newComment.save()

            res.json({newComment})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateComment: async (req, res) => {
        try {
            const { content } = req.body
            
            await Comments.findOneAndUpdate({
                _id: req.params.id, user: req.user._id
            }, {content})

            res.json({msg: 'Update Success!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    likeComment: async (req, res) => {
        try {
            const comment = await Comments.find({_id: req.params.id, likes: req.user._id})
            if(comment.length > 0) return res.status(400).json({msg: "You liked this post."})

            await Comments.findOneAndUpdate({_id: req.params.id}, {
                $push: {likes: req.user._id}
            }, {new: true})

            res.json({msg: 'Liked Comment!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unLikeComment: async (req, res) => {
        try {

            await Comments.findOneAndUpdate({_id: req.params.id}, {
                $pull: {likes: req.user._id}
            }, {new: true})

            res.json({msg: 'UnLiked Comment!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteComment: async (req, res) => {
        try {
            const comment = await Comments.findOne({
                _id: req.params.id,
                $or: [
                    {user: req.user._id},
                    {postUserId: req.user._id}
                ]
            })

            if (!comment) return res.status(400).json({msg: "Comment not found or unauthorized."})

            if(comment.images && comment.images.length > 0) {
                for(const img of comment.images) {
                    if(img.public_id) {
                        try {
                            await deleteCloudinaryMedia(img.public_id)
                        } catch(err) {
                            console.error("Cloudinary delete error:", err)
                        }
                    }
                }
            }

            await Comments.findOneAndDelete({_id: req.params.id})

            await Posts.findOneAndUpdate({_id: comment.postId}, {
                $pull: {comments: req.params.id}
            })

            res.json({msg: 'Deleted Comment!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}

const deleteCloudinaryMedia = (publicId) => {
    return new Promise((resolve, reject) => {
        const crypto = require('crypto');
        const https = require('https');

        const timestamp = Math.round(new Date().getTime() / 1000);
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dwquuisuj';
        const apiKey = process.env.CLOUDINARY_API_KEY || '655351295167741';
        const apiSecret = process.env.CLOUDINARY_API_SECRET || 'F0UAKwbXYzDbcTbFr43iwL0D0qQ';

        const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const postData = JSON.stringify({
            public_id: publicId,
            timestamp: timestamp,
            api_key: apiKey,
            signature: signature
        });

        const options = {
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${cloudName}/image/destroy`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const request = https.request(options, (response) => {
            let rawData = '';
            response.on('data', (chunk) => { rawData += chunk; });
            response.on('end', () => {
                try {
                    const parsed = JSON.parse(rawData);
                    resolve(parsed);
                } catch (e) {
                    reject(new Error(`Failed to parse destroy response: ${rawData}`));
                }
            });
        });

        request.on('error', (e) => { reject(e); });
        request.write(postData);
        request.end();
    });
};

module.exports = commentCtrl