var express = require('express');
var cors = require('cors');
var path = require('path');

var indexRouter = require('./routes/index');

var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404
app.use(function(req, res, next) {
  res.status(404).json({ error: 'Not found' });
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({ error: 'Server error' });
});

module.exports = app;
