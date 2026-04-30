const { board } = require('../_lib/mock');
module.exports = (req, res) => {
  const rows = board.rows.filter(r => r.boardStatus !== 'closed');
  res.json({ ok: true, rows, total: rows.length, day: board.day });
};
