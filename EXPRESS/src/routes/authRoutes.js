const express = require('express');
const controller = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireCsrf } = require('../middlewares/csrfMiddleware');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', requireAuth, requireCsrf, controller.logout);
router.get('/me', requireAuth, controller.getCurrentUser);

module.exports = router;
