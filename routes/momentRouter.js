const router = require('express').Router()
const momentCtrl = require('../controllers/momentCtrl')
const auth = require('../middleware/auth')

router.route('/moments')
    .post(auth, momentCtrl.createMoment)
    .get(auth, momentCtrl.getFleets)

router.get('/moments/archive', auth, momentCtrl.getFleetsArchive)

router.post('/moments/:id/view', auth, momentCtrl.viewMoment)
router.delete('/moments/:id', auth, momentCtrl.deleteMoment)
router.patch('/moments/:id/vote', auth, momentCtrl.voteStoryPoll)

module.exports = router
