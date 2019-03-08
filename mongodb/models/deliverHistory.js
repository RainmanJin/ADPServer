/**
 * Created by yong.li on 2018/7/17.
 */
'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment');
const deliverHistorySchema = new Schema({
    deliver_serial_num: Number,                     //移交序列号
    state:{ type: Number, min: 1, max: 3 },         //移交状态：1:训练中，2:训练完成，3:训练异常
    state_train:{ type: Number, min: 1, max: 4 },   //测试状态：1:初始状态，2:测试中，3:测试完成，4:测试异常
    subjects:[Schema.Types.ObjectId],               //移交的主体集合    
    organizations:[{
        org_id:Schema.Types.ObjectId,               //移交机构的id
        org_name:String                             //移交机构的id
    }],
    model_version:String,                           //模型版本号
    model_path:String,                              //模型地址
    is_all_test:Boolean,                           //是否所有图片测试
    images_test_num:Number,                        //图片数量
    images_test_types:[String],                    //特殊图片测试类型
    creator:String,                                 //移交者
    finish_time:String,                             //移交完成时间
    create_time:String,                             //移交创建时间
    update_time:String,                             //移交更新时间
},{
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});
deliverHistorySchema.pre('save', function (next) {
    next();
});
deliverHistorySchema.methods = {
    updateAndSave: function () {
        return this.save();
    }
};
deliverHistorySchema.statics = {
    /**
     * 获取数据移交记录的列表
     * @param {Object} options 
     */
    list:async function (options) {
        let queryResult = await this.find(options.filter)
            .sort({
                updated: options.sort
            })
            .limit(options.pageInfo.perPageSize)
            .skip(options.pageInfo.skipSize)
            .exec();
        return queryResult;
    },
    /**
     * 根据id查询信息
     * @param {String} id 
     */
    queryInfoById:async function(id){
        var historyInfo = await this.findById(id).exec();
        return historyInfo;
    }
};
mongoose.model('DeliverHistory', deliverHistorySchema);