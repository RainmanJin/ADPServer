/**
 * Created by xiaoxu.song on 2018/5/21.
 */
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const websitesSchema = new Schema({
    name : String, // 网站名称
    addr : String, // 网站访问地址
    type: {
        name: String, // 第三级分类名称
        id: String, // 第三级分类Id
        nameList: Array, // 一到三级分类名称列表：["菜品", "四川菜", "麻辣"]
        path: Array, // 一到三级分类id列表：["5b45a603494f0a5c29db4c80", "5b45a60d494f0a5c29db4c82", "5b45a618494f0a5c29db4c83"]
    },
    createAt: String,
    updateAt: String,
}, {
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});

websitesSchema.pre('save',function(next){
    next();
});

websitesSchema.methods = {
};

websitesSchema.statics = {
};
//注册mongoose模型，其他地方可以直接 mongoose.model('Test)调用
mongoose.model('websites', websitesSchema, 'websites');
