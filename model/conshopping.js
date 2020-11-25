var mongoose = require('mongoose');

//内容的表结构
var conshoppingSchema = new mongoose.Schema({

    //关联字段 - 用户id
    user: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'User'
    },
    product:{
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'product'
    },
    //购物车的商品
    conName: {
        type: String,
        default:""
    },
     //购物车的图片
     conImg: {
        type: String,
        default:""
    },
       //购物车的价格
    concost: {
        type: Number,
        default:0
    },
    //购物车的总金额
    total: {
        type: Number,
        default:0
    },
      //购物车的数量
      conumber: {
        type: Number,
        default: 1
    },
});



module.exports = mongoose.model('conshopping', conshoppingSchema);