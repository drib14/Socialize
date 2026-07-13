const router = require('express').Router()
const messageCtrl = require('../controllers/messageCtrl')
const auth = require('../middleware/auth')

router.post('/message', auth, messageCtrl.createMessage)

router.get('/conversations', auth, messageCtrl.getConversations)

router.get('/message/:id', auth, messageCtrl.getMessages)

router.delete('/message/:id', auth, messageCtrl.deleteMessages)

router.put('/message/:id', auth, messageCtrl.updateMessage)

router.patch('/message/:id/react', auth, messageCtrl.reactMessage)

router.patch('/message/read/:id', auth, messageCtrl.markMessagesAsRead)

router.delete('/conversation/:id', auth, messageCtrl.deleteConversation)

module.exports = router