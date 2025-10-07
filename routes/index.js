const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load recipes data
let recipes = [];
try {
  const recipesData = fs.readFileSync(path.resolve(__dirname, '../recipes.json'), 'utf8');
  recipes = JSON.parse(recipesData);
} catch (error) {
  console.error('Error loading recipes:', error);
}

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

  try {
    // Filter recipes based on ingredients
    const filteredRecipes = recipes.filter(recipe => {
      const recipeIngredients = (recipe.Ingredients || '').toLowerCase();
      return ingredients.some(ingredient => 
        recipeIngredients.includes(ingredient)
      );
    }).slice(0, 20); // Limit to 20 results

    res.json(filteredRecipes);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;