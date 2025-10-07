# Indian Recipe API

A simple Node.js API to search Indian recipes by ingredients.

## Features
- Search recipes by ingredients (comma-separated)
- 6000+ Indian recipes database
- Fast JSON-based search
- CORS enabled for web apps

## API Usage

### Search Recipes
```
GET /?q=tomato,onion
```

**Example:**
```
https://your-app.onrender.com/?q=chicken
https://your-app.onrender.com/?q=tomato,rice
```

## Local Development

1. Clone repository
2. Run `npm install`
3. Run `npm start`
4. API available at `http://localhost:4000`

## Deployment

This API is ready for deployment on:
- Render
- Railway
- Heroku
- Vercel

No database setup required - uses JSON file for fast searches.

## Response Format

Returns array of recipe objects with:
- RecipeName
- Ingredients
- Instructions
- PrepTime, CookTime, TotalTime
- Cuisine, Course, Diet
- And more...