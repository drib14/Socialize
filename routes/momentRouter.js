const router = require('express').Router()
const momentCtrl = require('../controllers/momentCtrl')
const auth = require('../middleware/auth')

router.route('/moments')
    .post(auth, momentCtrl.createMoment)
    .get(auth, momentCtrl.getMoments)

router.get('/moments/archive', auth, momentCtrl.getMomentsArchive)

router.post('/moments/:id/view', auth, momentCtrl.viewMoment)
router.delete('/moments/:id', auth, momentCtrl.deleteMoment)

module.exports = router
