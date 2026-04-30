const { history } = require('./_lib/mock');
module.exports = (req, res) => { res.json(history); };
