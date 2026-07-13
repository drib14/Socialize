const router = require('express').Router()
const fleetCtrl = require('../controllers/fleetCtrl')
const auth = require('../middleware/auth')

router.post('/fleets', auth, fleetCtrl.createHighlight)
router.get('/fleets/:id', auth, fleetCtrl.getHighlights)
router.get('/fleet/:id', auth, fleetCtrl.getHighlight)
router.patch('/fleet/:id/add', auth, fleetCtrl.addMomentToHighlight)
router.patch('/fleet/:id/remove', auth, fleetCtrl.removeMomentFromHighlight)
router.patch('/fleet/:id', auth, fleetCtrl.updateHighlight)
router.delete('/fleet/:id', auth, fleetCtrl.deleteHighlight)

module.exports = router
