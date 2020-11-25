var mongoose = require('mongoose');

//内容的表结构
var orderSchema = new mongoose.Schema({

    //关联字段 - 用户id
    user: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'User'
    },
        //添加时间
    Time: {
            type: Date,
            default: new Date()
        },
    orderid: {type: String },//订单号
    status: { type: Number ,default:0}, // 订单状态 0 待付款 1 待收货（已支付）  3 已发货 
    ordername: { type: String }, // 收货人
    ordertel: { type: String }, // 手机
    orderaddress: { type: String },// 地址
    ordertotal: { type: Number },
    "orderlist":[{
        //购物车的商品
        conName: String,
         //购物车的图片
         conImg: String, 
       
           //购物车的价格
        concost: Number,
       
        //购物车的总金额
        total: Number,
   
          //购物车的数量
          conumber: Number
        

    }]

});



module.exports = mongoose.model('order', orderSchema);