var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
 //用户名
 username: String,
 //密码
 password: String,
 //图片位置
 imagepath: String,
 //电话号码
telephone: {
        type: String,
        default: ''
    },
 //收货地址
address: {
        type: String,
        default: ''
    },
 //是否是商家
isAdmin: {
     type: Boolean,
     default: false
 }


});
//这里会数据库会创建一个users集合
module.exports = mongoose.model('User', UserSchema);