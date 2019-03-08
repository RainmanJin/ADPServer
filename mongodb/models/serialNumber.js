/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const serialNumberSchema = new Schema({
    name: String,//名称
    value:Number//编号值
}, {
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});
serialNumberSchema.pre('save', function (next) {
    next();
});

serialNumberSchema.methods = {
    updateAndSave: function () {
        return this.save();
    }
};

serialNumberSchema.statics = {

};
//注册mongoose模型，其他地方可以直接 mongoose.model('Category')调用
mongoose.model('SerialNumber', serialNumberSchema);
