var mongoose = require('mongoose');

//分类的表结构
var categoriesSchema= new mongoose.Schema({

    //分类名称
    name: String

});

module.exports = mongoose.model('Category', categoriesSchema);