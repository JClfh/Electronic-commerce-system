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

//商家首页
router.get('/', function(req, res, next) {
   
    Product.find().sort({_id: -1}).populate(['category']).then(function(products) {
        console.log(products)
        res.render('product', {
            user: req.userInfo,
            products: products
        });
    });

  });

//栏目添加页面
router.get('/categoryadd', function(req, res, next) {
    Category.find().sort({_id: -1}).then(function(categories) {
        res.render('categoryadd', {
            user: req.userInfo,
            category: categories
        });
    });
  });
  //栏目添加操作
router.post('/cateadd', function(req, res, next) {
    var name = req.body.name || '';
    //数据库中是否已经存在同名分类名称
    Category.findOne({
        name: name
    }).then(function(rs) {
        if (rs) {
            console.log('分类已经存在了');
            res.send("<script>alert('分类已经存在了');location.href='/product/categoryadd'</script>");
            return Promise.reject();
        } else {
            //数据库中不存在该分类，可以保存
          var category = new Category({
                name: name
            });
            return category.save();
        }
    }).then(function(newCategory) {

        console.log('保存成功');
        Category.find().sort({_id: -1}).then(function(categories) {
            res.render('categoryadd', {
                user: req.userInfo,
                category: categories
            });
        });
    })
    
  });

//分类的编辑界面
router.get('/categoryedit', function (req, res) {
    var id = req.query.id || '';
    console.log(id)
    Category.findOne({
      _id: id
    }).then(function (category) {
      res.render('categoryedit', {
        user: req.userInfo,
        category: category
      })
  
    });
  });

//分类的修改保存
router.post('/categoryedit', function(req, res) {
    //获取要修改的分类的信息，并且用表单的形式展现出来
    var id = req.query.id || '';
    //获取post提交过来的名称
    var name = req.body.name || '';
    console.log("id",id)
    //获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then(function(category) {
        if (!category) {
            res.send("<script>alert('修改失败');location.href='/product/categoryadd'</script>");
            return Promise.reject();
        } else {
            //当用户没有做任何的修改提交的时候
            if (name == category.name) {
                res.send("<script>alert('修改成功');location.href='/product/categoryadd'</script>");
                return Promise.reject();
            } else {
                //要修改的分类名称是否已经在数据库中存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                });
            }
        }
    }).then(function(sameCategory) {
        if (sameCategory) {
            res.send("<script>alert('分类已经存在了');location.href='/product/categoryadd'</script>");
            return Promise.reject();
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function() {
        res.send("<script>alert('修改成功');location.href='/product/categoryadd'</script>");
    })

});

// 删除
router.get('/categorydelete', function (req, res) {
    var id = req.query.id || '';
    Category.remove({
      _id: id
    }).then(function () {
        res.send("<script>alert('删除成功');location.href='/product/categoryadd'</script>");
    });
  });

  //商品添加
  router.get('/productadd', function(req, res, next) {
    Category.find().sort({_id: -1}).then(function(categories) {
        res.render('productadd', {
            user: req.userInfo,
            category: categories
        })
    });
  });
  //商品添加操作
  router.post('/doproductadd',function(req, res){
    // console.log('111');
     //上传照片
     var form = new formidable.IncomingForm();//创建一个formidable对象
     //图片上传后的存储路径
     //  var form = new multiparty.Form({ uploadDir: './public/img' });
     form.uploadDir = path.dirname(__dirname) + '/public/images/';
     form.keepExtensions = true; //保留后缀
     form.encoding = 'utf-8'; // 编码
     form.type = true;
     form.parse(req, function (error, fields, files) {
        console.log("============================================",fields);

       var category = fields.category;//分类
       var proName = fields.proName;//商品名称
       var procost = fields.procost;//商品价格
       var description = fields.description;//简介
       console.log("files.file",files.proImg)
       if (files.proImg.size==0) {
         console.log("未上传图片，使用默认图片");
         var proImg = "\\public\\images\\login.png";
       }
       else {
         var proImg = "\\public\\images\\" + files.proImg.path.split(path.sep).pop();
       }
       //库存
       if (fields.inventory=="") {
        console.log("库存=====================0");
        var inventory = 0;//库存
      }
      else {
        var inventory = fields.inventory;//库存
      }
       console.log(proImg);
       //用户名是否已经被注册了，如果数据库中已经存在和我们要注册的用户名同名的数据，表示该用户名已经被注册了
       Product.findOne({
            proName: proName
       }).then(function (pro) {
         if (pro) {
           //表示数据库中有该记录
           return res.send("<script>alert('商品名称存在');location.href='/product/productadd'</script>");
         }
         //保存用户注册的信息到数据库中
         var product = new Product({
            category : fields.category,//分类
            proName : fields.proName,//商品名称
            procost :fields.procost,//商品价格
            inventory:inventory,//库存
            proImg: proImg.split("public")[1],
            description :fields.description,
            user:req.userInfo._id.toString()
           
         });
         return product.save();
       }).then(function (newproduct) {
        console.log('添加成功');
         res.send("<script>alert('添加商品成功');location.href='/product'</script>");
       });
     });
  });

  //商品修改
  router.get('/productedit', function(req, res, next) {
    var id = req.query.id || '';
    var category = [];

    Category.find().sort({_id: 1}).then(function(categories) {
      category = categories;
        return Product.findOne({
            _id: id
        }).populate('category');
    }).then(function(content) {
        if (!content) {
          res.send("<script>alert('查找不到数据');location.href='/product/productedit'</script>");
            return Promise.reject();
        } else {
          console.log(category)
            res.render('productedit', {
                user: req.userInfo,
                category: category,
                products: content
            })
        }
    });
  });

  //商品修改操作
  router.post('/productedit', function(req, res) {
    // console.log('111');
    var _id = req.query.id || '';
    //上传照片
    console.log("_id",_id)
    var form = new formidable.IncomingForm();//创建一个formidable对象
    //图片上传后的存储路径
    //  var form = new multiparty.Form({ uploadDir: './public/img' });
    form.uploadDir = path.dirname(__dirname) + '/public/images/';
    form.keepExtensions = true; //保留后缀
    form.encoding = 'utf-8'; // 编码
    form.type = true;
    form.parse(req, function (error, fields, files) {
      //  console.log(fields,files);
      var category = fields.category;//分类
      var proName = fields.proName;//商品名称
      var procost = fields.procost;//商品价格
      var inventory = fields.inventory;//库存
      var description = fields.description;//简介

      var a ={
        category : fields.category,//分类
        proName : fields.proName,//商品名称
        procost :fields.procost,//商品价格
        inventory:fields.inventory,//库存
        description :fields.description,
        user:req.userInfo._id.toString()  
      }

       if (files.proImg.size==0) {
        console.log("=======================不修改图片=============================");
     
      }
      else {
        a.proImg="\\images\\" + files.proImg.path.split(path.sep).pop();
        console.log("==="+a.proImg);
      }

      Product.update({
        _id: _id
      },a).then(function (newproduct) {
       console.log('修改成功');
        res.send("<script>alert('修改商品成功');location.href='/product'</script>");
      });
    });

});

//商品删除
// 删除
router.get('/productdelete', function (req, res) {
  var id = req.query.id || '';
  Product.remove({
    _id: id
  }).then(function () {
      res.send("<script>alert('删除成功');location.href='/product'</script>");
  });
});

//商品查询
router.get('/search', function (req, res) {
  console.log('查询成功');
  console.log(req.query);
  var n=req.query.name;
  Product.find({$or:[{"procost":{"$regex":parseInt(n)}},{"proName":{"$regex":n}},{n}]}).populate(['category']).sort({_id: -1}).then(function (product) {
    res.render('product', {
      user: req.userInfo,
      products: product
  });
  });
});

/**
 * 商品列表
 */
router.get('/productlist', function(req, res, next) {
   
      console.log("商品列表")
      var category = [];

      Category.find().then(function(categories) {
        category = categories;
          return Product.find().populate('category');
      }).then(function(products) {
          if (!products) {
            res.send("<script>alert('查找不到数据');location.href='/product/productlist'</script>");
              return Promise.reject();
          } else {
            console.log(category)
              res.render('productlist', {
                  user: req.userInfo,
                  category: category,
                  products: products
              })
          }
      });

});
//分类点击筛选
router.get('/protlist', function(req, res, next) {
  var _id = req.query.id || '';
  console.log("商品列表")
  // var category = [];
  Category.find().then(function(categories) {
    category = categories;
  }).then(Product.find({"category": mongoose.Types.ObjectId(_id)}).then(function(products) {
    console.log("products",products)
    res.render('productlist', {
      user: req.userInfo,
      category: category,
      products: products
  })
    return;     
  }))

});



/**
 * 订单管理页面
 **/
router.get('/productorder', function(req, res, next) {
  console.log("==========================================================")
  Order.find().then(function (orders) {
    console.log("========================", orders)
    res.render('productorder', {
      user: req.userInfo,
      orders:orders
    })
  })
});
//订单详情页
router.get('/proorderxq', function (req, res, next) {
  var id = req.query.id || '';
  Order.findOne({ _id: id}).then(function (order) {
    console.log("========================", order)
    res.render('proorderxq', {
      user: req.userInfo,
      order:order
    })
  })
});
//订单接单
router.get('/proorderjd', function (req, res, next) {
  var id = req.query.id || '';
  console.log("========================", id)
  Order.update({
    _id: id
  }, {
    status: 2                  //修改状态， 订单状态 0 待付款 1接单 2 待收货（已支付）  3 已发货 4收货

  }).then(function () {
   
    res.send("<script>alert('接单成功');location.href='/product/productorder'</script>");
  })

});
//订单发货
router.get('/proorderfh', function (req, res, next) {
  var id = req.query.id || '';
  console.log("========================", id)
  Order.update({
    _id: id
  }, {
    status: 3                 //修改状态， 订单状态 0 待付款 1接单 2 待收货（已支付）  3 已发货 4收货

  }).then(function () {
   
    res.send("<script>alert('发货成功');location.href='/product/productorder'</script>");
  })

});


  module.exports = router;