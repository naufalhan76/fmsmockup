module.exports = (req, res) => {
  res.json({ ok: true, config: { autoStart: false, pollIntervalMs: 60000, accounts: [{ id: 'demo', label: 'Demo Account', hasSessionCookie: true, authEmail: 'demo@gpstracker.id' }] } });
};
