const router = require('express').Router()
const savedCollectionCtrl = require('../controllers/savedCollectionCtrl')
const auth = require('../middleware/auth')

router.post('/saved_collections', auth, savedCollectionCtrl.createCollection)
router.get('/saved_collections', auth, savedCollectionCtrl.getCollections)
router.get('/saved_collections/:id', auth, savedCollectionCtrl.getCollection)
router.patch('/saved_collections/:id/add', auth, savedCollectionCtrl.addToCollection)
router.patch('/saved_collections/:id/remove', auth, savedCollectionCtrl.removeFromCollection)
router.patch('/saved_collections/:id', auth, savedCollectionCtrl.updateCollection)
router.delete('/saved_collections/:id', auth, savedCollectionCtrl.deleteCollection)

module.exports = router
