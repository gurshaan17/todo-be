const express = require("express")
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController')
const router = express.Router()

router.post('/create', auth, taskController.create)
router.put('/edit/:id', auth, taskController.edit)
router.get('/all', auth, taskController.getAll)
router.delete('/delete/:id', auth, taskController.delete)

module.exports = router;