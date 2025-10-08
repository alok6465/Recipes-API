const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

// Maximum compatibility CORS
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-JSON');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text());
app.use(express.raw());

// Load recipes
let recipes = [];
try {
  const recipesData = fs.readFileSync(path.join(__dirname, 'recipes.json'), 'utf8');
  recipes = JSON.parse(recipesData);
  console.log(`Loaded ${recipes.length} recipes`);
} catch (error) {
  console.error('Error loading recipes:', error.message);
}

// Universal response handler
function universalResponse(req, res, data) {
  const callback = req.query.callback || req.query.jsonp;
  const format = req.query.format || 'json';
  
  // Handle different response formats
  if (callback) {
    // JSONP for older browsers/cross-domain
    res.type('application/javascript');
    return res.send(`${callback}(${JSON.stringify(data)});`);
  }
  
  if (format === 'xml') {
    res.type('application/xml');
    return res.send(`<?xml version="1.0"?><response>${JSON.stringify(data)}</response>`);
  }
  
  // Default JSON
  res.type('application/json');
  res.json(data);
}

// Search function
function searchRecipes(query) {
  if (!query) return [];
  
  const ingredients = query.split(',').map(i => i.trim().toLowerCase());
  return recipes.filter(recipe => {
    const recipeIngredients = (recipe.Ingredients || '').toLowerCase();
    return ingredients.some(ingredient => 
      recipeIngredients.includes(ingredient)
    );
  }).slice(0, 20);
}

// Handle ALL HTTP methods for maximum compatibility
['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
  app[method.toLowerCase()]('/', (req, res) => {
    const query = req.query.q || req.body?.q || req.body?.query || req.query.query;
    
    if (!query) {
      return universalResponse(req, res, {
        message: "Provide ingredients: /?q=tomato,onion",
        example: "/?q=chicken or POST with {\"q\":\"rice,dal\"}"
      });
    }

    try {
      const results = searchRecipes(query);
      universalResponse(req, res, results);
    } catch (error) {
      universalResponse(req, res, { error: "Search failed" });
    }
  });
});

// Structured API endpoint
['GET', 'POST'].forEach(method => {
  app[method.toLowerCase()]('/api/recipes', (req, res) => {
    const query = req.query.q || req.body?.q || req.body?.query;
    
    if (!query) {
      return universalResponse(req, res, {
        success: false,
        message: "Provide ingredients using q parameter",
        data: []
      });
    }

    try {
      const results = searchRecipes(query);
      universalResponse(req, res, {
        success: true,
        count: results.length,
        query: query,
        data: results
      });
    } catch (error) {
      universalResponse(req, res, {
        success: false,
        message: "Search failed",
        data: []
      });
    }
  });
});

// OPTIONS for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', '*');
  res.sendStatus(200);
});

// Health check
app.get('/health', (req, res) => {
  universalResponse(req, res, {
    status: 'OK',
    recipes: recipes.length,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    formats: ['json', 'jsonp', 'xml'],
    endpoints: {
      basic: '/?q=tomato',
      api: '/api/recipes?q=tomato',
      post: 'POST / with {"q":"tomato"}',
      jsonp: '/?q=tomato&callback=func'
    }
  });
});

// Catch all other routes
app.use('*', (req, res) => {
  universalResponse(req, res, {
    error: 'Route not found',
    available: ['/', '/api/recipes', '/health']
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🌍 Universal Recipe API running on port ${port}`);
  console.log(`📱 Mobile | 💻 Laptop | 📟 Tablet | 🖥️ Desktop - ALL SUPPORTED`);
});