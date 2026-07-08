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
            const { content, images } = req.body

            if(content.trim().length === 0 && images.length === 0)
            return res.status(400).json({msg: "Please add content or a photo."})

            const newPost = new Posts({
                content, images, user: req.user._id
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
            const features =  new APIfeatures(Posts.find({
                user: [...req.user.following, req.user._id]
            }), req.query).paginating()

            const posts = await features.query.sort('-createdAt')
            .populate("user likes", "avatar username fullname followers")
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
                    select: "avatar username fullname"
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
            const { content, images } = req.body

            const post = await Posts.findOneAndUpdate({_id: req.params.id}, {
                content, images
            }).populate("user likes", "avatar username fullname")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            res.json({
                msg: "Updated Post!",
                newPost: {
                    ...post._doc,
                    content, images
                }
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
            const features = new APIfeatures(Posts.find({user: req.params.id}), req.query)
            .paginating()
            const posts = await features.query.sort("-createdAt")
            .populate("user likes", "avatar username fullname followers")
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
    getPost: async (req, res) => {
        try {
            const post = await Posts.findById(req.params.id)
            .populate("user likes", "avatar username fullname followers")
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
                    select: "avatar username fullname"
                }
            })

            if(!post) return res.status(400).json({msg: 'This post does not exist.'})

            res.json({
                post
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPostsDicover: async (req, res) => {
        try {

            const newArr = [...req.user.following, req.user._id]

            const num  = req.query.num || 9

            const posts = await Posts.aggregate([
                { $match: { user : { $nin: newArr } } },
                { $sample: { size: Number(num) } },
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
            const post = await Posts.findOneAndDelete({_id: req.params.id, user: req.user._id})
            await Comments.deleteMany({_id: {$in: post.comments }})

            res.json({
                msg: 'Deleted Post!',
                newPost: {
                    ...post,
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
            .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname"
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
            const originalPost = await Posts.findById(req.params.id)
            if(!originalPost) return res.status(400).json({msg: 'This post does not exist.'})

            const alreadyReposted = await Posts.findOne({user: req.user._id, repostOf: req.params.id})
            if(alreadyReposted) return res.status(400).json({msg: 'You already reposted this post.'})

            const newPost = new Posts({
                content: '',
                images: [],
                user: req.user._id,
                repostOf: req.params.id
            })

            await newPost.save()

            const populatedPost = await Posts.findById(newPost._id)
            .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "repostOf",
                populate: {
                    path: "user likes",
                    select: "avatar username fullname"
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
    }
}

module.exports = postCtrl