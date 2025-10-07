const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Load recipes data
let recipes = [];
try {
  const recipesData = fs.readFileSync(path.join(__dirname, 'recipes.json'), 'utf8');
  recipes = JSON.parse(recipesData);
  console.log(`Loaded ${recipes.length} recipes`);
} catch (error) {
  console.error('Error loading recipes:', error.message);
}

// API Route
app.get('/', (req, res) => {
  if (!req.query.q) {
    return res.send("No input given");
  }

  const rawQuery = req.query.q;
  const ingredients = rawQuery.split(',').map(i => i.trim().toLowerCase());

  if (ingredients.length === 0) {
    return res.json([]);
  }

  try {
    const filteredRecipes = recipes.filter(recipe => {
      const recipeIngredients = (recipe.Ingredients || '').toLowerCase();
      return ingredients.some(ingredient => 
        recipeIngredients.includes(ingredient)
      );
    }).slice(0, 20);

    res.json(filteredRecipes);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', recipes: recipes.length });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Indian Recipe API running on port ${port}`);
});