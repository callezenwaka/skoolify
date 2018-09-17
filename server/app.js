require('dotenv').config();
const express = require('express')
const http = require('http');
const path = require('path');
const favicon = require('serve-favicon');
const cors = require('cors')
const morgan = require('morgan');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();
const posts = require('./routes/posts');
const postsApi = require('./routes/api/posts');
const index = require('./routes/index');

// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;
const URL = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI_DEV;
// const URL = process.env.MONGODB_URI_DEV;
mongoose.connect(URL, { useNewUrlParser: true })
  .then(() => console.log(`Database connected`))
  .catch(err => console.log(`Database connection error: ${err.message}`));

//require moment
app.locals.moment = require('moment');

// Middleware
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/posts', posts);
app.use('/api/v1/posts', postsApi);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen( process.env.PORT, () => {
    console.log('Server started on port', process.env.PORT, ' … ');
});

module.exports = app;