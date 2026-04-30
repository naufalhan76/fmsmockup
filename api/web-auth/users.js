const { DEMO_USER } = require('../_lib/mock');
module.exports = (req, res) => { res.json({ ok: true, users: [DEMO_USER] }); };
