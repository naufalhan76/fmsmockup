const { DEMO_USER } = require('../_lib/mock');
module.exports = (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  const body = req.body || {};
  if (body.username === 'demo' && body.password === 'demo123') {
    return res.json({ ok: true, user: DEMO_USER });
  }
  return res.status(401).json({ ok: false, error: 'Username atau password salah. Gunakan demo / demo123' });
};
