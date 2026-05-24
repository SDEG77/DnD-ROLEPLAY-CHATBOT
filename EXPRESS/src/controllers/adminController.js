const Campaign = require('../models/Campaign');
const User = require('../models/User');
const {
  createAdminEntryGrant,
  createAdminSessionToken,
  getClientOrigin,
  validateAdminKeyFile,
  verifyAdminEntryGrant,
} = require('../services/adminAccessService');
const {
  clearAdminAuthCookies,
  setAdminAuthCookies,
  setAdminCsrfCookie,
} = require('../utils/adminAuthCookies');

function buildAdminUser(admin) {
  return {
    role: admin.role,
    label: admin.label,
    keyId: admin.keyId,
  };
}

async function enterAdmin(req, res) {
  try {
    const grant = createAdminEntryGrant();
    const targetUrl = new URL('/endmin', getClientOrigin());
    targetUrl.searchParams.set('grant', grant);

    return res.redirect(targetUrl.toString());
  } catch (error) {
    console.error('Failed to create admin entry grant:', error);
    return res.status(500).json({
      error: 'Failed to initialize admin entry.',
      detail: error.message || 'Unknown server error.',
    });
  }
}

async function unlockAdmin(req, res) {
  try {
    const grantToken = req.body.grantToken || '';
    const keyFile = req.body.keyFile || '';
    const passphrase = req.body.passphrase || '';

    if (!grantToken || !keyFile || !passphrase) {
      return res.status(400).json({
        error: 'grantToken, keyFile, and passphrase are required.',
      });
    }

    verifyAdminEntryGrant(grantToken);
    const adminIdentity = validateAdminKeyFile({ keyFile, passphrase });
    const csrfToken = setAdminAuthCookies(req, res, createAdminSessionToken(adminIdentity));

    return res.json({
      csrfToken,
      admin: {
        role: 'admin',
        label: adminIdentity.label,
        keyId: adminIdentity.keyId,
      },
    });
  } catch (error) {
    console.error('Failed to unlock admin session:', error);
    clearAdminAuthCookies(req, res);
    return res.status(401).json({
      error: 'Failed to unlock admin session.',
      detail: error.message || 'Admin unlock failed.',
    });
  }
}

async function getAdminSession(req, res) {
  const csrfToken = setAdminCsrfCookie(req, res);
  return res.json({
    csrfToken,
    admin: buildAdminUser(req.admin),
  });
}

async function logoutAdmin(req, res) {
  clearAdminAuthCookies(req, res);
  return res.json({ ok: true });
}

async function listAdminUsers(req, res) {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('_id name email createdAt updatedAt')
      .lean();

    return res.json({
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error('Failed to list admin users:', error);
    return res.status(500).json({
      error: 'Failed to load user accounts.',
      detail: error.message || 'Unknown server error.',
    });
  }
}

async function getAdminMetrics(req, res) {
  try {
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);

    const [
      totalUsers,
      totalCampaigns,
      totalMessagesAgg,
      usersLast7Days,
      usersLast30Days,
      campaignsLast7Days,
      campaignsLast30Days,
      latestUsers,
      latestCampaigns,
    ] = await Promise.all([
      User.countDocuments({}),
      Campaign.countDocuments({}),
      Campaign.aggregate([
        {
          $project: {
            messageCount: { $size: '$messages' },
          },
        },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: '$messageCount' },
          },
        },
      ]),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      Campaign.countDocuments({ createdAt: { $gte: last7Days } }),
      Campaign.countDocuments({ createdAt: { $gte: last30Days } }),
      User.find({}).sort({ createdAt: -1 }).limit(5).select('name email createdAt').lean(),
      Campaign.find({}).sort({ createdAt: -1 }).limit(5).select('title characterName createdAt').lean(),
    ]);

    return res.json({
      totals: {
        users: totalUsers,
        campaigns: totalCampaigns,
        messages: totalMessagesAgg[0]?.totalMessages || 0,
      },
      recent: {
        usersLast7Days,
        usersLast30Days,
        campaignsLast7Days,
        campaignsLast30Days,
      },
      latest: {
        users: latestUsers,
        campaigns: latestCampaigns,
      },
    });
  } catch (error) {
    console.error('Failed to load admin metrics:', error);
    return res.status(500).json({
      error: 'Failed to load admin metrics.',
      detail: error.message || 'Unknown server error.',
    });
  }
}

module.exports = {
  enterAdmin,
  getAdminMetrics,
  getAdminSession,
  listAdminUsers,
  logoutAdmin,
  unlockAdmin,
};
