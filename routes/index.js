const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const router = express.Router();

// GET /?q=chicken,tomato
router.get('/', function (req, res, next) {
  if (!req.query.q) {
    return res.send("No input given");
  }

  const rawQuery = req.query.q;
  const ingredients = rawQuery.split(',').map(i => i.trim().toLowerCase());

  if (ingredients.length === 0) {
    return res.json([]);
  }

  // Build SQL WHERE clause like: LOWER(Ingredients) LIKE ? OR LOWER(Ingredients) LIKE ? ...
  const whereClauses = ingredients.map(() => 'LOWER(Ingredients) LIKE ?').join(' OR ');
  const values = ingredients.map(i => `%${i}%`);

  const SQLquery = `SELECT * FROM recipe WHERE ${whereClauses} LIMIT 20`;

  try {
    const db = new Database(path.resolve(__dirname, '../recipe.sqlite'));
    
    const stmt = db.prepare(SQLquery);
    const rows = stmt.all(...values);
    
    db.close();
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Query failed" });
  }
});

module.exports = router;
