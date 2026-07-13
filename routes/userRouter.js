const router = require('express').Router()
const auth = require("../middleware/auth")
const userCtrl = require("../controllers/userCtrl")


router.get('/search', auth, userCtrl.searchUser)

router.get('/user/:id', auth, userCtrl.getUser)

router.patch('/user', auth, userCtrl.updateUser)

router.patch('/user/:id/follow', auth, userCtrl.follow)
router.patch('/user/:id/unfollow', auth, userCtrl.unfollow)

router.patch('/user/:id/block', auth, userCtrl.blockUser)
router.patch('/user/:id/unblock', auth, userCtrl.unblockUser)
router.patch('/user/:id/add_close_friend', auth, userCtrl.addCloseFriend)
router.patch('/user/:id/remove_close_friend', auth, userCtrl.removeCloseFriend)

router.get('/user_requests', auth, userCtrl.getFollowRequests)
router.patch('/user_requests/:id/accept', auth, userCtrl.acceptFollowRequest)
router.delete('/user_requests/:id/decline', auth, userCtrl.declineFollowRequest)

router.get('/suggestionsUser', auth, userCtrl.suggestionsUser)

router.get('/user_by_username/:username', auth, userCtrl.getUserByUsername)

module.exports = router