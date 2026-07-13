const router = require('express').Router()
const postCtrl = require('../controllers/postCtrl')
const auth = require('../middleware/auth')

router.route('/posts')
    .post(auth, postCtrl.createPost)
    .get(auth, postCtrl.getPosts)

router.route('/post/:id')
    .patch(auth, postCtrl.updatePost)
    .get(auth, postCtrl.getPost)
    .delete(auth, postCtrl.deletePost)

router.patch('/post/:id/like', auth, postCtrl.likePost)

router.patch('/post/:id/unlike', auth, postCtrl.unLikePost)

router.post('/post/:id/repost', auth, postCtrl.repostPost)

router.get('/user_posts/:id', auth, postCtrl.getUserPosts)

router.get('/post_discover', auth, postCtrl.getPostsDicover)

router.patch('/savePost/:id', auth, postCtrl.savePost)

router.patch('/unSavePost/:id', auth, postCtrl.unSavePost)

router.get('/getSavePosts', auth, postCtrl.getSavePosts)

router.get('/posts/tag/:tag', auth, postCtrl.getPostsByTag)

router.patch('/post/:id/view', auth, postCtrl.recordPostView)
router.patch('/post/:id/poll_vote', auth, postCtrl.votePollOption)
router.patch('/post/:id/pin', auth, postCtrl.pinPost)
router.get('/trending_tags', auth, postCtrl.getTrendingTags)

router.post('/upload_media', auth, postCtrl.uploadMedia)

router.get('/location_key', auth, (req, res) => {
    res.json({ key: process.env.LOCATIONIQ_ACCESS_TOKEN })
})

module.exports = router