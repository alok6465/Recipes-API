const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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

  const db = new sqlite3.Database(path.resolve(__dirname, '../recipe.sqlite'));

  db.serialize(() => {
    db.all(SQLquery, values, (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: "Query failed" });
      } else {
        res.json(rows);
      }
    });
  });

  db.close();
});

module.exports = router;
