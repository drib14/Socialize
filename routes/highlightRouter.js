const router = require('express').Router()
const highlightCtrl = require('../controllers/highlightCtrl')
const auth = require('../middleware/auth')

router.post('/highlights', auth, highlightCtrl.createHighlight)
router.get('/highlights/:id', auth, highlightCtrl.getHighlights)
router.get('/highlight/:id', auth, highlightCtrl.getHighlight)
router.patch('/highlight/:id/add', auth, highlightCtrl.addMomentToHighlight)
router.patch('/highlight/:id/remove', auth, highlightCtrl.removeMomentFromHighlight)
router.patch('/highlight/:id', auth, highlightCtrl.updateHighlight)
router.delete('/highlight/:id', auth, highlightCtrl.deleteHighlight)

module.exports = router
