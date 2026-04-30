const fs = require('fs');
const path = require('path');

const MOCK = path.join(process.cwd(), 'mock');
let board, history, incidents;
try {
  board = JSON.parse(fs.readFileSync(path.join(MOCK, 'board.json'), 'utf8'));
  history = JSON.parse(fs.readFileSync(path.join(MOCK, 'history.json'), 'utf8'));
  incidents = JSON.parse(fs.readFileSync(path.join(MOCK, 'incidents.json'), 'utf8'));
} catch(e) {
  board = { rows: [], day: '2026-05-01' };
  history = { ok: true, records: [] };
  incidents = { ok: true, incidents: [] };
}

const DEMO_USER = { id: 'demo-user', username: 'demo', displayName: 'Demo User', role: 'admin', isActive: true };
const overrides = {};
let loggedIn = true;

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname.replace('/api', '') || '/';
  const m = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (m === 'OPTIONS') return res.status(204).end();

  // Parse body for POST
  let body = {};
  if (m === 'POST' && req.body) body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // Auth
  if (p === '/web-auth/login') {
    if (body.username === 'demo' && body.password === 'demo123') {
      loggedIn = true;
      return res.json({ ok: true, user: DEMO_USER });
    }
    return res.status(401).json({ ok: false, error: 'Username atau password salah. Gunakan demo / demo123' });
  }
  if (p === '/web-auth/logout') { loggedIn = false; return res.json({ ok: true }); }
  if (p === '/web-session') return res.json({ ok: true, session: loggedIn ? { user: DEMO_USER } : null });
  if (p === '/web-auth/users') return res.json({ ok: true, users: [DEMO_USER] });

  // Status
  if (p === '/status') return res.json({ ok: true, status: { runtime: { isPolling: true, nextRunAt: Date.now() + 60000 }, webAuth: { sessionUser: loggedIn ? DEMO_USER : null }, accounts: { demo: { units: {} } } } });

  // Board
  if (p === '/tms/board') return res.json({ ok: true, rows: board.rows.filter(r => r.boardStatus !== 'closed'), total: board.rows.length, day: board.day });
  if (p === '/tms/board/detail') {
    const rowId = url.searchParams.get('rowId') || '';
    const row = board.rows.find(r => r.rowId === rowId);
    if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.json({ ok: true, detail: { ...row, incidentHistory: incidents.incidents } });
  }

  // History
  if (p === '/unit-history') return res.json(history);

  // Overrides
  if (p.match(/^\/tms\/overrides\/[^/]+\/audit$/) && m === 'GET') return res.json({ ok: true, audit: [] });
  if (p.match(/^\/tms\/overrides\/[^/]+$/) && m === 'POST') {
    const id = decodeURIComponent(p.split('/')[3] || '');
    overrides[id] = { ...body, at: new Date().toISOString() };
    if (body.shippingStatus) {
      const row = board.rows.find(r => r.jobOrderId === id);
      if (row && row.metadata) {
        row.metadata.shippingStatus = body.shippingStatus;
        if (body.shippingStatus.key === 'selesai-pengiriman') row.boardStatus = 'closed';
      }
    }
    return res.json({ ok: true, override: overrides[id] });
  }
  if (p.match(/^\/tms\/overrides\/[^/]+$/) && m === 'DELETE') return res.json({ ok: true });

  // Misc
  if (p === '/tms/crew-phone') return res.json({ ok: true, phone: '081234567890', name: 'BUDI SANTOSO' });
  if (p === '/config') return res.json({ ok: true, config: { autoStart: false, pollIntervalMs: 60000, accounts: [{ id: 'demo', label: 'Demo Account', hasSessionCookie: true, authEmail: 'demo@gpstracker.id' }] } });
  if (p === '/save-config') return res.json({ ok: true });
  if (p === '/auth/login' || p === '/auth/logout' || p === '/tms/auth/logout') return res.json({ ok: true });

  if (p.startsWith('/astro/')) return res.json({ ok: true, snapshots: [] });
  return res.status(404).json({ error: 'API endpoint not found: ' + p });
};


