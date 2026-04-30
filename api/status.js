const { DEMO_USER } = require('./_lib/mock');
module.exports = (req, res) => {
  res.json({ ok: true, status: { runtime: { isPolling: true, nextRunAt: Date.now() + 60000 }, webAuth: { sessionUser: DEMO_USER }, accounts: { demo: { units: {} } } } });
};
