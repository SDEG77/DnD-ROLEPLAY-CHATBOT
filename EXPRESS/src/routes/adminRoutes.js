const express = require('express');
const controller = require('../controllers/adminController');
const { requireAdminAuth } = require('../middlewares/adminAuthMiddleware');
const { requireAdminCsrf } = require('../middlewares/adminCsrfMiddleware');

const router = express.Router();

router.post('/session/unlock', controller.unlockAdmin);
router.get('/session', requireAdminAuth, controller.getAdminSession);
router.post('/logout', requireAdminAuth, requireAdminCsrf, controller.logoutAdmin);
router.get('/users', requireAdminAuth, controller.listAdminUsers);
router.get('/metrics', requireAdminAuth, controller.getAdminMetrics);

module.exports = router;
