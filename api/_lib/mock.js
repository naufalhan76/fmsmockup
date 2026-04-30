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
module.exports = { board, history, incidents, DEMO_USER };
