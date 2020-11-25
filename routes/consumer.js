var express = require('express');
var router = express.Router();
var User = require('../model/user');//连接数据库
var Category = require('../model/Category');//分类
var Product = require('../model/product');//商品
var Conshopping = require('../model/conshopping');//购物车
var Order = require('../model/order');//订单
var formidable = require("formidable");//图片上传
var path = require("path");          //导入path模块
fs = require("fs");
var crypto = require('crypto');//加密
var mongoose = require('mongoose');
var UUID = require('uuid');//随机数
const product = require('../model/product');
//用户首页
router.get('/', function (req, res, next) {
  console.log("商品列表")
  var category = [];
  Category.find().then(function (categories) {
    category = categories;
    return Product.find().populate('category');
  }).then(function (products) {
    if (!products) {
      res.send("<script>alert('查找不到数据');location.href='/consumer'</script>");
      return Promise.reject();
    } else {
      console.log(category)
      res.render('consumer', {
        user: req.userInfo,
        category: category,
        products: products
      })
    }
  });


});
//分类点击筛选
router.get('/conlist', function (req, res, next) {
  var _id = req.query.id || '';
  console.log("商品列表")
  // var category = [];
  Category.find().then(function (categories) {
    category = categories;
  }).then(Product.find({ "category": mongoose.Types.ObjectId(_id) }).then(function (products) {
    res.render('consumer', {
      user: req.userInfo,
      category: category,
      products: products
    })

  }))

});

//商品查询
router.get('/search', function (req, res) {
  console.log('查询成功');
  console.log(req.query);
  var n = req.query.name;
  Category.find().then(function (categories) {
    category = categories;
  }).then(Product.find({ $or: [{ "procost": { "$regex": parseInt(n) } }, { "proName": { "$regex": n } }] }).populate(['category']).then(function (products) {
    console.log("products", products)
    res.render('consumer', {
      user: req.userInfo,
      category: category,
      products: products
    })
    return;
  }));
});

//个人中心
router.get('/concenter', function (req, res, next) {

  User.findOne({ _id: req.userInfo._id }).then(function (newuserInfo) {
    console.log("======================", newuserInfo);
    res.render('concenter', {
      user: req.userInfo,
      newuserInfo: newuserInfo
    });
  })


});
//修改个人中心
router.post('/conedit', function (req, res, next) {

  //上传照片
  var form = new formidable.IncomingForm();//创建一个formidable对象
  //图片上传后的存储路径
  //  var form = new multiparty.Form({ uploadDir: './public/img' });
  form.uploadDir = path.dirname(__dirname) + '/public/images/';
  form.keepExtensions = true; //保留后缀
  form.encoding = 'utf-8'; // 编码
  form.type = true;
  form.parse(req, function (error, fields, files) {
    console.log("======================", fields, files);
    console.log("======================", fields.username);
    var username = fields.username;//用户名
    var telephone = fields.telephone;//电话
    var address = fields.address;//地址
    var a = {
      username: fields.username,//用户名
      telephone: fields.telephone,//电话
      address: fields.address//地址
    }
    if (files.imagepath.size == 0) {
      console.log("=======================不修改图片=============================");
      a.imagepath = req.userInfo.imagepath
    }
    else {
      a.imagepath = "\\images\\" + files.imagepath.path.split(path.sep).pop();
      console.log("===" + a.imagepath);
    }
    console.log("======================", a);

    User.updateOne({
      _id: req.userInfo._id
    }, a).then(function (userInfo) {
      req.cookies.set('userInfo', JSON.stringify({
        _id: req.userInfo._id,
        username: username,
        imagepath: a.imagepath,
        telephone: telephone
      }));

      console.log(userInfo)
      res.send("<script>alert('修改成功');location.href='/consumer/concenter'</script>");
    })

  });

});
/*
*商品详情
*/
router.get('/condetails', function (req, res, next) {

  var _id = req.query.id || '';

  Product.findOne({ _id: _id }).then(function (products) {
    console.log("=============", products)
    res.render('condetails', {
      user: req.userInfo,
      products: products
    });
  })


});

//购物车界面
router.get('/conshopping', function (req, res, next) {
  Conshopping.find({ "user": req.userInfo }).then(function (shopping) {

    console.log(shopping)
    var price = 0
    for (var item in shopping) {
      price += shopping[item].total
    }
    res.render('conshopping', {
      user: req.userInfo,
      shopping: shopping,
      price: price
    });
  })

});

//加入购物车界面
router.get('/conshop', function (req, res, next) {
  var _id = req.query.id || '';

  console.log("===============================================", _id)
  Conshopping.findOne({ product: _id, user: req.userInfo }).then(function (products) {
    console.log(products)
    if (products) {
      console.log("商品存在", products.conumber + 1);

      Conshopping.update({
        //条件
        product: _id
      }, {
        conumber: products.conumber + 1,
        total: products.concost * (products.conumber + 1)
      }).then(
        res.send("<script>alert('成功加入购物车');location.href='/consumer'</script>")
      )

    } else {
      product.findOne({ _id: _id }).then(function (products) {
        var conName = products.proName;
        var conImg = products.proImg;
        var concost = products.procost;//价格
        var shopping = new Conshopping({
          conName: conName,
          conImg: conImg,
          conumber: 1,
          concost: concost,
          total: concost,
          product: products,
          user: req.userInfo
        });
        return shopping.save();
      })

    }
  }).then(function (newshop) {
    res.send("<script>alert('成功加入购物车');location.href='/consumer'</script>");
  })

});
//在详情页面加入购物车界面
router.post('/condetails', function (req, res, next) {
  var _id = req.query.id || '';

  console.log("===============================================", _id)
  Conshopping.findOne({ product: _id, user: req.userInfo }).then(function (products) {
    console.log(products)
    if (products) {
      console.log("商品存在", products.conumber + 1);

      Conshopping.update({
        //条件
        product: _id
      }, {
        conumber: products.conumber + 1,
        total: products.concost * (products.conumber + 1)
      }).then(
        res.send("<script>alert('成功加入购物车');location.href='/consumer'</script>")
      )

    } else {
      product.findOne({ _id: _id }).then(function (products) {
        var conName = products.proName;
        var conImg = products.proImg;
        var concost = products.procost;//价格
        var shopping = new Conshopping({
          conName: conName,
          conImg: conImg,
          conumber: 1,
          concost: concost,
          total: concost,
          product: products,
          user: req.userInfo
        });
        return shopping.save();
      })

    }
  }).then(function (newshop) {
    res.send("<script>alert('成功加入购物车');location.href='/consumer'</script>");
  })

});
//购物车删除
router.get('/condelete', function (req, res) {
  var id = req.query.id || '';
  Conshopping.remove({
    _id: id
  }).then(function () {
    res.send("<script>alert('删除成功');location.href='/consumer/conshopping'</script>");
  });

});


//购物车结算生成订单
router.get('/conorderInfo', function (req, res) {

  let orderid = UUID.v1() // 生成订单的id
  console.log(orderid)
  var ordername = req.userInfo.username//收货人
  var ordertel = req.userInfo.telephone//电话号码
  User.findOne({ _id: req.userInfo._id }).then(function (newuserInfo) {
    useraddress = newuserInfo.address
    console.log("===================", useraddress)
    console.log("===================", newuserInfo)
  }).then(Conshopping.find({ user: req.userInfo }).then(function (shopping) {
    console.log("===================", shopping)
    var price = 0//总价格
    for (var item in shopping) {
      price += shopping[item].total
    };
    console.log("===================", price)
    var order = new Order({
      orderid: orderid,
      orderlist: shopping,//购物车的数据
      ordername: ordername,
      ordertel: ordertel,
      orderaddress: useraddress,//地址,
      user: req.userInfo,
      ordertotal: price
    });
     order.save();
     res.render('conorderInfo', {
      user: req.userInfo,
      order: order
    });
  }))




});
//==========订单付款
router.get('/conmyorderpayment', function (req, res, next) {
  var id = req.query.id || '';
  console.log("========================", id)
  Order.update({
    _id: id
  }, {
    status: 1                  //修改状态， 订单状态 0 待付款 1接单 2 待收货（已支付）  3 已发货 4收货

  }).then(function () {
    Conshopping.remove({ user: req.userInfo }).then(function () {
      res.send("<script>alert('付款成功');location.href='/consumer/conmyorder'</script>");
    })
  })


});


/**
 * 
 * 我的订单
 */
router.get('/conmyorder', function (req, res, next) {

  Order.find({ user: req.userInfo }).then(function (orders) {
    console.log("========================", orders)
    res.render('conmyorder', {
      user: req.userInfo,
      orders:orders
    })
  })



});
//订单详情页
router.get('/conmyorderxq', function (req, res, next) {
  var id = req.query.id || '';
  Order.findOne({ _id: id}).then(function (order) {
    console.log("========================", order)
    res.render('conmyorderxq', {
      user: req.userInfo,
      order:order
    })
  })

});
//取消订单order
router.get('/conorderdelete', function (req, res) {

  var id = req.query.id || '';
  console.log("========================", id)
  Order.remove({
    _id: id
  }).then(function () {
    res.send("<script>alert('取消订单成功');location.href='/consumer/conmyorder'</script>");
  });

});

//订单收货
router.get('/conmyordersh', function (req, res, next) {
  var id = req.query.id || '';
  console.log("========================", id)
  Order.update({
    _id: id
  }, {
    status: 4                  //修改状态， 订单状态 0 待付款 1接单 2 待收货（已支付）  3 已发货 4收货

  }).then(function () {
   
    res.send("<script>alert('发货成功');location.href='/consumer/conmyorder'</script>");
  })

});

//商品查询
router.get('/ordresearch', function (req, res) {
  console.log('查询成功');
  console.log(req.query);
  var n = req.query.name;
  Order.find({ $or: [{ "orderid": { "$regex": n} }] }).then(function (orders) {
    res.render('conmyorder', {
      user: req.userInfo,
      orders:orders
    })
          })
});


module.exports = router;