var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sellerRouter = require('./routes/Sellers');
var AdminRouter = require('./routes/Admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  optionsSuccessStatus: 204,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  maxAge: 86400,
};
// app.use(cors(corsOptions));
app.use(cors());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/Seller', sellerRouter);
app.use('/Admin', AdminRouter);


app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  
  res.status(err.status || 500);
  res.render('error');
});

// Listen on port 5000
// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

module.exports = app;


// druvzanzmera
// 5YFite3Z5xdByiwF
// (49.34.249.6