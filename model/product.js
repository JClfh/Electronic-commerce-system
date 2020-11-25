var mongoose = require('mongoose');

//内容的表结构
var productSchema = new mongoose.Schema({
    //关联字段 - 内容分类的id
    category: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Category'
    },
    //商品名称
    proName: String,
     //商品图片位置
     proImg: String,
     //价格
     procost:String,
    //关联字段 - 用户id
    user: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'User'
    },
    //添加时间
    addTime: {
        type: Date,
        default: new Date()
    },
    //销量
    views: {
        type: Number,
        default: 0
    },
    //库存
    inventory: {
        type: Number,
        default: 0
    },
    //简介
    description: {
        type: String,
        default: ''
    },
    //内容
    content: {
        type: String,
        default: ''
    },
    //评论
    comments: {
        type: Array,
        default: []
    }

});

module.exports = mongoose.model('product', productSchema);