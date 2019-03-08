/**
 * Created by yong.li on 2018/7/03.
 */
'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment');
const groupSchema = new Schema({
    name:String,                                //组名称
    desc:String,                                //组描述
    members:[Schema.Types.ObjectId],            //组成员
    create_time:String,                         //爬虫创建时间
    update_time:String,                         //爬虫更新时间
},{
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});
groupSchema.pre('save', function (next) {
    next();
});
groupSchema.methods = {
    updateAndSave: function () {
        return this.save();
    }
};
groupSchema.statics = {
    /**
     * 获取爬虫批次任务的列表
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
     * @param {String} groupId 
     */
    queryInfoById:async function(groupId){
        var groupInfo = await this.findById(groupId).exec();
        return groupInfo;
    }
};
mongoose.model('Group', groupSchema);