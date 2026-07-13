const Posts = require('../models/postModel')
const Comments = require('../models/commentModel')
const Users = require('../models/userModel')

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

const postCtrl = {
    createPost: async (req, res) => {
        try {
            const { content, images, location, altText, commentsDisabled, hideLikeCounts, taggedUsers, audioTrack } = req.body

            if((!content || content.trim().length === 0) && (!images || images.length === 0))
            return res.status(400).json({msg: "Please add content or a photo."})

            const contentStr = content || ''
            const hashtags = contentStr.match(/#\w+/g)?.map(tag => tag.slice(1).toLowerCase()) || []

            const hasVideo = images && images.some(img => img.resource_type === 'video')
            const isReel = hasVideo ? true : false

            const newPost = new Posts({
                content, images, user: req.user._id, location,
                tags: hashtags,
                altText: altText || '',
                commentsDisabled: commentsDisabled || false,
                hideLikeCounts: hideLikeCounts || false,
                taggedUsers: taggedUsers || [],
                isReel,
                audioTrack: {
                    title: audioTrack?.title || 'Original Audio',
                    artist: audioTrack?.artist || req.user.username
                }
            })
            await newPost.save()

            res.json({
                msg: 'Created Post!',
                newPost: {
                    ...newPost._doc,
                    user: req.user
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPosts: async (req, res) => {
        try {
            const myBlocked = req.user.blockedUsers || []
            const usersWhoBlockedMe = await Users.find({ blockedUsers: req.user._id }).select('_id')
            const excludeUsers = [...myBlocked, ...usersWhoBlockedMe.map(u => u._id)]

            const query = {
                $or: [
                    { user: req.user._id },
                    { user: { $in: req.user.following } }
                ],
                user: { $nin: excludeUsers }
            }

            const features =  new APIfeatures(Posts.find(query), req.query).paginating()

            const posts = await features.query.sort('-createdAt')
            .populate("user likes views", "avatar username fullname followers lastActive")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname lastActive"
                }
            })

            res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updatePost: async (req, res) => {
        try {
            const { content, images, location, altText, commentsDisabled, hideLikeCounts, taggedUsers, audioTrack } = req.body

            const contentStr = content || ''
            const hashtags = contentStr.match(/#\w+/g)?.map(tag => tag.slice(1).toLowerCase()) || []

            const hasVideo = images && images.some(img => img.resource_type === 'video')
            const isReel = hasVideo ? true : false

            const post = await Posts.findOneAndUpdate({_id: req.params.id, user: req.user._id}, {
                content, images, location,
                altText: altText || '',
                commentsDisabled: commentsDisabled || false,
                hideLikeCounts: hideLikeCounts || false,
                taggedUsers: taggedUsers || [],
                tags: hashtags,
                isReel,
                ...(audioTrack ? {
                    audioTrack: {
                        title: audioTrack.title || 'Original Audio',
                        artist: audioTrack.artist || req.user.username
                    }
                } : {})
            }, { new: true }).populate("user likes", "avatar username fullname lastActive")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            if(!post) return res.status(400).json({msg: 'This post does not exist or you are not authorized.'})

            res.json({
                msg: "Updated Post!",
                newPost: post
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    likePost: async (req, res) => {
        try {
            const post = await Posts.find({_id: req.params.id, likes: req.user._id})
            if(post.length > 0) return res.status(400).json({msg: "You liked this post."})

            const like = await Posts.findOneAndUpdate({_id: req.params.id}, {
                $push: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This post does not exist.'})

            res.json({msg: 'Liked Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unLikePost: async (req, res) => {
        try {

            const like = await Posts.findOneAndUpdate({_id: req.params.id}, {
                $pull: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This post does not exist.'})

            res.json({msg: 'UnLiked Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserPosts: async (req, res) => {
        try {
            const targetId = req.params.id
            const myBlocked = req.user.blockedUsers || []
            const targetUser = await Users.findById(targetId)

            if (!targetUser || myBlocked.some(id => (id._id || id).toString() === targetId.toString()) || 
                targetUser.blockedUsers.some(id => (id._id || id).toString() === req.user._id.toString())) {
                return res.json({ posts: [], result: 0 })
            }

            // Check if profile is private and not followed by current user
            if (targetUser.isPrivate && targetId.toString() !== req.user._id.toString()) {
                const isFollowing = targetUser.followers.some(id => (id._id || id).toString() === req.user._id.toString())
                if (!isFollowing) {
                    return res.status(403).json({ msg: "This account is private." })
                }
            }

            const features = new APIfeatures(Posts.find({ user: targetId }), req.query)
            .paginating()
            const posts = await features.query.sort("-isPinned -createdAt")
            .populate("user likes views", "avatar username fullname followers")
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname"
                }
            })

            res.json({
                posts,
                result: posts.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getTaggedPosts: async (req, res) => {
        try {
            const targetId = req.params.id
            const targetUser = await Users.findById(targetId)
            if (!targetUser) return res.status(404).json({ msg: "User not found." })

            const myBlocked = req.user.blockedUsers || []
            const targetUserBlocked = targetUser.blockedUsers || []

            // Query posts where targetId is in the taggedUsers array
            const query = {
                taggedUsers: targetId,
                user: { $nin: [...myBlocked.map(id => (id._id || id)), ...targetUserBlocked.map(id => (id._id || id))] }
            }

            const features = new APIfeatures(Posts.find(query), req.query).paginating()

            const posts = await features.query.sort("-createdAt")
                .populate("user likes views", "avatar username fullname followers")
                .populate({
                    path: "repostOf",
                    populate: {
                        path: "user likes",
                        select: "avatar username fullname"
                    }
                })

            res.json({
                posts,
                result: posts.length
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getReelsPosts: async (req, res) => {
        try {
            const myBlocked = req.user.blockedUsers || []
            const usersWhoBlockedMe = await Users.find({ blockedUsers: req.user._id }).select('_id')
            const excludeUsers = [...myBlocked.map(id => (id._id || id)), ...usersWhoBlockedMe.map(u => u._id)]

            const excludeIds = excludeUsers.map(id => new mongoose.Types.ObjectId(id))
            const limitVal = Number(req.query.limit) || 9
            const pageVal = Number(req.query.page) || 1
            const skipVal = (pageVal - 1) * limitVal

            const rawPosts = await Posts.aggregate([
                { 
                    $match: { 
                        $or: [
                            { "images.url": { $regex: /video/i } },
                            { "images.url": { $regex: /\.mp4|\.mov|\.webm|\.avi/i } }
                        ],
                        user: { $nin: excludeIds }
                    } 
                },
                { $addFields: { 
                    likesCount: { $size: { $ifNull: [ "$likes", [] ] } },
                    commentsCount: { $size: { $ifNull: [ "$comments", [] ] } },
                    viewsCount: { $size: { $ifNull: [ "$views", [] ] } }
                }},
                { $addFields: {
                    engagementScore: { 
                        $add: [ 
                            "$likesCount", 
                            { $multiply: [ "$commentsCount", 2 ] }, 
                            { $multiply: [ "$viewsCount", 0.5 ] } 
                        ] 
                    }
                }},
                { $sort: { engagementScore: -1, createdAt: -1 } },
                { $skip: skipVal },
                { $limit: limitVal }
            ])

            const posts = await Posts.populate(rawPosts, [
                { path: "user likes views", select: "avatar username fullname followers lastActive" },
                { 
                    path: "comments", 
                    populate: { 
                        path: "user likes", 
                        select: "-password" 
                    } 
                },
                {
                    path: "repostOf",
                    populate: {
                        path: "user likes",
                        select: "avatar username fullname lastActive"
                    }
                }
            ])

            res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getPost: async (req, res) => {
        try {
            const post = await Posts.findById(req.params.id)
            .populate("user likes views", "avatar username fullname followers lastActive")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname lastActive"
                }
            })

            if(!post) return res.status(400).json({msg: 'This post does not exist.'})

            const authorId = post.user._id.toString()
            const authorUser = await Users.findById(authorId)
            const myBlocked = req.user.blockedUsers || []
            if (myBlocked.some(id => (id._id || id).toString() === authorId) || 
                (authorUser && authorUser.blockedUsers.some(id => (id._id || id).toString() === req.user._id.toString()))) {
                return res.status(403).json({msg: "You are blocked or not authorized to view this post."})
            }

            if (authorId !== req.user._id.toString()) {
                if (post.visibility === 'private') {
                    return res.status(403).json({msg: "This post is private."})
                }
                if (post.visibility === 'followers') {
                    const isFollowing = authorUser && authorUser.followers.some(id => (id._id || id).toString() === req.user._id.toString())
                    if (!isFollowing) {
                        return res.status(403).json({msg: "This post is for followers only."})
                    }
                }
            }

            res.json({
                post
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPostsDicover: async (req, res) => {
        try {
            const myBlocked = req.user.blockedUsers || []
            const usersWhoBlockedMe = await Users.find({ blockedUsers: req.user._id }).select('_id')
            const excludeUsers = [...myBlocked.map(id => (id._id || id)), ...usersWhoBlockedMe.map(u => u._id)]

            const newArr = [...req.user.following, req.user._id, ...excludeUsers]
            const num  = req.query.num || 9

            // Calculate engagement score: likes + 2 * comments, sorting by engagement score then date
            const excludeIds = newArr.map(id => new mongoose.Types.ObjectId(id))
            const rawPosts = await Posts.aggregate([
                { $match: { user: { $nin: excludeIds }, visibility: 'public' } },
                { $addFields: { 
                    likesCount: { $size: { $ifNull: [ "$likes", [] ] } },
                    commentsCount: { $size: { $ifNull: [ "$comments", [] ] } }
                }},
                { $addFields: {
                    engagementScore: { $add: [ "$likesCount", { $multiply: [ "$commentsCount", 2 ] } ] }
                }},
                { $sort: { engagementScore: -1, createdAt: -1 } },
                { $limit: Number(num) }
            ])

            const posts = await Posts.populate(rawPosts, [
                { path: "user likes views", select: "avatar username fullname followers lastActive" },
                { 
                    path: "comments", 
                    populate: { 
                        path: "user likes", 
                        select: "-password" 
                    } 
                }
            ])

            return res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deletePost: async (req, res) => {
        try {
            const post = await Posts.findOne({_id: req.params.id, user: req.user._id})
            if(!post) return res.status(400).json({msg: 'Post not found or unauthorized.'})

            if(post.images && post.images.length > 0) {
                for(const img of post.images) {
                    if(img.public_id) {
                        try {
                            await deleteCloudinaryMedia(img.public_id, img.resource_type || 'image')
                        } catch(err) {
                            console.error("Cloudinary delete error:", err)
                        }
                    }
                }
            }

            await Posts.findOneAndDelete({_id: req.params.id})
            await Comments.deleteMany({_id: {$in: post.comments }})

            res.json({
                msg: 'Deleted Post!',
                newPost: {
                    ...post._doc,
                    user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    savePost: async (req, res) => {
        try {
            const user = await Users.find({_id: req.user._id, saved: req.params.id})
            if(user.length > 0) return res.status(400).json({msg: "You saved this post."})

            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $push: {saved: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'Saved Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unSavePost: async (req, res) => {
        try {
            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {saved: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'unSaved Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getSavePosts: async (req, res) => {
        try {
            const features = new APIfeatures(Posts.find({
                _id: {$in: req.user.saved}
            }), req.query).paginating()

            const savePosts = await features.query.sort("-createdAt")
            .populate("user likes views", "avatar username fullname followers lastActive")
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname lastActive"
                }
            })

            res.json({
                savePosts,
                result: savePosts.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    repostPost: async (req, res) => {
        try {
            const { content } = req.body
            const originalPost = await Posts.findById(req.params.id)
            if(!originalPost) return res.status(400).json({msg: 'This post does not exist.'})

            if (!content) {
                const alreadyReposted = await Posts.findOne({user: req.user._id, repostOf: req.params.id, content: ''})
                if(alreadyReposted) return res.status(400).json({msg: 'You already reposted this post.'})
            }

            const newPost = new Posts({
                content: content || '',
                images: [],
                user: req.user._id,
                repostOf: req.params.id
            })

            await newPost.save()

            const populatedPost = await Posts.findById(newPost._id)
            .populate("user likes views", "avatar username fullname followers lastActive")
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname lastActive"
                }
            })

            res.json({
                msg: 'Reposted Post!',
                newPost: populatedPost
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    uploadMedia: async (req, res) => {
        try {
            const { file } = req.body;
            if(!file) return res.status(400).json({msg: "No file provided."});

            const crypto = require('crypto');
            const https = require('https');

            const timestamp = Math.round(new Date().getTime() / 1000);
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dwquuisuj';
            const apiKey = process.env.CLOUDINARY_API_KEY || '655351295167741';
            const apiSecret = process.env.CLOUDINARY_API_SECRET || 'F0UAKwbXYzDbcTbFr43iwL0D0qQ';

            const stringToSign = `timestamp=${timestamp}${apiSecret}`;
            const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

            const postData = JSON.stringify({
                file: file,
                timestamp: timestamp,
                api_key: apiKey,
                signature: signature
            });

            const options = {
                hostname: 'api.cloudinary.com',
                path: `/v1_1/${cloudName}/auto/upload`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const cloudinaryUpload = () => {
                return new Promise((resolve, reject) => {
                    const request = https.request(options, (response) => {
                        let rawData = '';
                        response.on('data', (chunk) => { rawData += chunk; });
                        response.on('end', () => {
                            try {
                                const parsed = JSON.parse(rawData);
                                if (response.statusCode >= 200 && response.statusCode < 300) {
                                    resolve(parsed);
                                } else {
                                    reject(new Error(parsed.error?.message || `Cloudinary status ${response.statusCode}`));
                                }
                            } catch (e) {
                                reject(new Error(`Failed to parse response: ${rawData}`));
                            }
                        });
                    });

                    request.on('error', (e) => { reject(e); });
                    request.write(postData);
                    request.end();
                });
            };

            const data = await cloudinaryUpload();
            res.json({
                public_id: data.public_id,
                secure_url: data.secure_url
            });

        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    getPostsByTag: async (req, res) => {
        try {
            const hashtag = req.params.tag.toLowerCase();
            const myBlocked = req.user.blockedUsers || [];
            const usersWhoBlockedMe = await Users.find({ blockedUsers: req.user._id }).select('_id');
            const excludeUsers = [...myBlocked.map(id => (id._id || id)), ...usersWhoBlockedMe.map(u => u._id)];

            const features = new APIfeatures(Posts.find({
                tags: hashtag,
                user: { $nin: excludeUsers },
                $or: [
                    { user: req.user._id },
                    { visibility: 'public' },
                    { user: { $in: req.user.following }, visibility: 'followers' }
                ]
            }), req.query).paginating();

            const posts = await features.query.sort('-createdAt')
                .populate("user likes", "avatar username fullname followers lastActive")
                .populate({
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "-password"
                    }
                })
                .populate({
                    path: "repostOf",
                    populate: {
                        path: "user likes",
                        select: "avatar username fullname lastActive"
                    }
                });

            res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    recordPostView: async (req, res) => {
        try {
            const post = await Posts.findById(req.params.id)
            if(!post) return res.status(400).json({msg: 'This post does not exist.'})

            if(!post.views.includes(req.user._id)){
                await Posts.findOneAndUpdate({_id: req.params.id}, {
                    $push: {views: req.user._id}
                })
            }

            res.json({msg: 'View recorded.'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    votePollOption: async (req, res) => {
        try {
            const { optionId } = req.body
            const post = await Posts.findById(req.params.id)
            if(!post) return res.status(400).json({msg: 'This post does not exist.'})

            const hasVoted = post.poll.options.some(opt => opt.votes.includes(req.user._id))
            if(hasVoted) return res.status(400).json({msg: 'You have already voted on this poll.'})

            const updatedPost = await Posts.findOneAndUpdate(
                { _id: req.params.id, "poll.options._id": optionId },
                { $push: { "poll.options.$.votes": req.user._id } },
                { new: true }
            ).populate("user likes", "avatar username fullname followers lastActive")
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname lastActive"
                }
            })

            res.json({
                msg: 'Vote registered.',
                post: updatedPost
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    pinPost: async (req, res) => {
        try {
            const post = await Posts.findById(req.params.id)
            if(!post) return res.status(400).json({msg: 'This post does not exist.'})

            if(post.user.toString() !== req.user._id.toString()){
                return res.status(403).json({msg: "You are not authorized to pin this post."})
            }

            const newPinState = !post.isPinned

            if(newPinState){
                const pinnedCount = await Posts.countDocuments({ user: req.user._id, isPinned: true })
                if (pinnedCount >= 3) {
                    return res.status(400).json({ msg: "You can only pin up to 3 posts on your profile." })
                }
            }

            const updatedPost = await Posts.findOneAndUpdate(
                {_id: req.params.id},
                {isPinned: newPinState},
                {new: true}
            ).populate("user likes", "avatar username fullname followers lastActive")
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname lastActive"
                }
            })

            res.json({
                msg: newPinState ? 'Post pinned to profile!' : 'Post unpinned!',
                post: updatedPost
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getTrendingTags: async (req, res) => {
        try {
            const posts = await Posts.find({
                $or: [
                    { user: req.user._id },
                    { visibility: 'public' },
                    { user: { $in: req.user.following }, visibility: 'followers' }
                ]
            }).select('tags')

            const tagCounts = {}
            posts.forEach(post => {
                if (post.tags) {
                    post.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1
                    })
                }
            })

            const sortedTags = Object.keys(tagCounts)
                .map(tag => ({ tag, count: tagCounts[tag] }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)

            res.json({ tags: sortedTags })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

const deleteCloudinaryMedia = (publicId, resourceType = 'image') => {
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
            path: `/v1_1/${cloudName}/${resourceType === 'video' ? 'video' : 'image'}/destroy`,
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

module.exports = postCtrl