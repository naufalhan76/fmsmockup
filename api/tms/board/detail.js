const { board, incidents } = require('../../_lib/mock');
module.exports = (req, res) => {
  const url = new URL(req.url, 'http://l');
  const rowId = url.searchParams.get('rowId') || '';
  const row = board.rows.find(r => r.rowId === rowId);
  if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, detail: { ...row, incidentHistory: incidents.incidents } });
};
