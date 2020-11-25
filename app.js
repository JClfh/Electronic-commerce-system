var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//加载数据库模块
var mongoose = require('mongoose');
//加载cookies模块
var Cookies = require('cookies');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var productRouter = require('./routes/product');
var consumerRouter = require('./routes/consumer');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置cookie
app.use(function(req, res, next) {
  req.cookies = new Cookies(req, res);
  //解析登录用户的cookie信息
  req.userInfo = {};
  if (req.cookies.get('userInfo')) {
      try {
          req.userInfo = JSON.parse(req.cookies.get('userInfo'));
          console.log(JSON.parse(req.cookies.get('userInfo')));
          //获取当前登录用户的类型，是否是管理员
          User.findById(req.userInfo._id).then(function(userInfo) {
              req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
              next();
          })
      }catch(e){
          next();
      }

  } else {
      next();
  }
} );

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);//登录注册
app.use('/product', productRouter);//商家
app.use('/consumer', consumerRouter);//用户
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
//
mongoose.connect('mongodb://localhost:27017/shop', function(err) {
    if (err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        app.listen(7777);
    }
});

//module.exports = app;
