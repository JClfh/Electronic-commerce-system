var express = require('express');
var router = express.Router();
var User = require('../model/user');//连接数据库
var formidable = require("formidable");//图片上传
var path = require("path");          //导入path模块
fs = require("fs");
var crypto = require('crypto');//加密

//进入登录界面
router.get('/', function(req, res, next) {
  res.render('login');
  });

  //进入注册界面
router.get('/register', function (req, res, next) {
  res.render('register');
});

//实现注册
router.post('/doRegister',function(req, res){
  console.log('111');
   //上传照片
   var form = new formidable.IncomingForm();//创建一个formidable对象
   //图片上传后的存储路径
   //  var form = new multiparty.Form({ uploadDir: './public/img' });
   form.uploadDir = path.dirname(__dirname) + '/public/images/';
   form.keepExtensions = true; //保留后缀
   form.encoding = 'utf-8'; // 编码
   form.type = true;
   form.parse(req, function (error, fields, files) {
     var username = fields.username;
     var password = fields.password;
     var repassword = fields.repassword;
     console.log(files.file);
     if (files.file.size == 0) {
       console.log("未上传图片，使用默认图片");
       var imagepath = "\\public\\images\\login.png"
     }
     else {
       var imagepath = "\\public\\images\\" + files.file.path.split(path.sep).pop();
     }
     //密码判断
     if (password != repassword) {
       console.log('两次输入的密码不一致');
       return res.send("<script>alert('密码不一致');location.href='/login/register'</script>");
     }
     //用户名是否已经被注册了，如果数据库中已经存在和我们要注册的用户名同名的数据，表示该用户名已经被注册了
     User.findOne({
       username: username
     }).then(function (userInfo) {
       if (userInfo) {
         //表示数据库中有该记录
         return res.send("<script>alert('用户存在');location.href='/login/register'</script>");
       }
       //保存用户注册的信息到数据库中
       var user = new User({
         username: username,
         password: crypto.createHash('md5').update(password).digest("hex"),
         imagepath: imagepath.split("public")[1],
       });
       return user.save();
     }).then(function (newUserInfo) {
      console.log('注册成功');
       res.send("<script>alert('注册成功');location.href='/login'</script>");
     });
   });
});

//实现登录
router.post('/dologin', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var userInfo;
  
  User.findOne({
    username: username,
    password: crypto.createHash('md5').update(password).digest("hex")
  }).then(function (userInfo) {
   
    userInfo = userInfo
    if (!userInfo) {
      console.log("用户名或密码错误")
      return res.send("<script>alert('用户名或密码错误');location.href='/login'</script>");
    }else{
      console.log("====================",userInfo.isAdmin)
    if(userInfo.isAdmin==false){
    console.log("2",userInfo)
    req.cookies.set('userInfo', JSON.stringify({
      _id: userInfo._id,
      username: userInfo.username,
      imagepath: userInfo.imagepath,
      telephone: userInfo.telephone
  
    }));
    res.send("<script>alert('登录成功');location.href='/consumer'</script>");
    }

    req.cookies.set('userInfo', JSON.stringify({
      _id: userInfo._id,
      username: userInfo.username,
      imagepath: userInfo.imagepath,
      telephone: userInfo.telephone
    
    }));
    res.send("<script>alert('登录成功');location.href='/product'</script>");
  }

  })
});

  module.exports = router;
