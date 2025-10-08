const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

// Mobile-friendly CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Security headers for mobile apps
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load recipes data
let recipes = [];
try {
  const recipesData = fs.readFileSync(path.join(__dirname, 'recipes.json'), 'utf8');
  recipes = JSON.parse(recipesData);
  console.log(`Loaded ${recipes.length} recipes`);
} catch (error) {
  console.error('Error loading recipes:', error.message);
}

// Handle preflight requests for mobile apps
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// API Route
app.get('/', (req, res) => {
  // Set mobile-friendly headers
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-cache');
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

// Mobile-friendly API endpoint
app.get('/api/recipes', (req, res) => {
  res.header('Content-Type', 'application/json');
  
  if (!req.query.q) {
    return res.json({ 
      success: false, 
      message: "Please provide ingredients using ?q=tomato,onion",
      data: [] 
    });
  }

  const rawQuery = req.query.q;
  const ingredients = rawQuery.split(',').map(i => i.trim().toLowerCase());

  try {
    const filteredRecipes = recipes.filter(recipe => {
      const recipeIngredients = (recipe.Ingredients || '').toLowerCase();
      return ingredients.some(ingredient => 
        recipeIngredients.includes(ingredient)
      );
    }).slice(0, 20);

    res.json({
      success: true,
      count: filteredRecipes.length,
      data: filteredRecipes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Search failed", 
      data: [] 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    recipes: recipes.length,
    endpoints: {
      search: '/?q=tomato,onion',
      mobile: '/api/recipes?q=tomato,onion'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Indian Recipe API running on port ${port}`);
});