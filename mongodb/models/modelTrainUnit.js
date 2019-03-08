/*
 * @Author: zhilin.yu
 * @Date: 2018-06-05 10:35:09
 * @LastEditors: zhilin.yu
 * @LastEditTime: 2018-06-05 21:05:41
 * @Description: 模型训练机构单位
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelTrainUnitSchema = new Schema({
    UnitName: {
        type: String,
        unique: true,
        dropDups: true,
        required: true
    }, //机构名称 唯一性
    address: {
        type: String
        // required: true
    }, //机构地址
    handRecord: [Schema.Types.ObjectId], //预留 移交记录 字段
    auditStatus: Number, //状态 ：1 有效  0 无效
    createdTime: String,
    updatedTime: String
}, {
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});

modelTrainUnitSchema.pre('save', function (next) {
    next();
});

modelTrainUnitSchema.methods = {
    updateAndSave: function () {

        return this.save();
    }
};

modelTrainUnitSchema.statics = {
    fetch: function (cb) {
        return this.find({})
            .sort('updated')
            .exec(cb);
    },
    findById: function (id, cb) {
        return this.findOne({
                _id: id
            })
            // .sort('updated')
            .exec(cb);
    },
    findByUnitName: function (name, cb) {
        return this.findOne({
                UnitName: name
            })
            // .sort('updated')
            .exec(cb);
    },
    list: function (options) {
        const findQuery = options.findQuery || {};
        // const criteria = options.criteria;
        const skip = options.skip || 0;
        const pageSize = options.pageSize || 10;
        const sortByUpdateTime = options.sortByUpdateTime || 1;
        return this.find(findQuery)
            .sort({
                updated: sortByUpdateTime
            })
            .limit(pageSize)
            .skip(skip)
            .exec();
    }
};
//注册mongoose模型，其他地方可以直接 mongoose.model('ModelTrainUnit')调用
mongoose.model('ModelTrainUnit', modelTrainUnitSchema);