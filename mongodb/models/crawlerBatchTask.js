/**
 * Created by yong.li on 2018/6/25.
 */
'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment');
const crawlerBatchSchema = new Schema({
    name:String,                                //批次名称
    batch_serial_num: Number,                   //批次任务序列号
    count:Number,                               //批次下的主体的个数
    state:{ type: Number, min: 1, max: 3 },     //批次状态：1:未启动，2:进行中，3：完成
    subjects:[
        {
            id_subject:String,                  //主体id
            name:String,                        //主体名称
            alias:[String]                      //主体别名
        }
    ],
    websites:[{
        id_website:String,                      //网站id
        name:String,                            //网站名称
        website_address:String,                 //网站网址
        require_num:{ type: Number, min: 1},    //单个网站爬虫要求数量
        real_num:Number,                        //单个网站爬虫实际数量
    }],
    creator:String,                             //创建者
    finish_time:String,                         //爬虫完成时间
    create_time:String,                         //爬虫创建时间
    update_time:String,                         //爬虫更新时间
},{
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});
/** todo...
 *  1.添加索引，提高查询效率
 */ 
crawlerBatchSchema.pre('save', function (next) {
    next();
});
crawlerBatchSchema.methods = {
    updateAndSave: function () {
        return this.save();
    }
};
crawlerBatchSchema.statics = {
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
     * 更新爬虫批次任务的状态
     * @param {String} taskId 
     */
    updateCrawlerBatchState:async function(taskId,state){
        let updateParams = {};
        if(state===3){  //批次任务完成则同时更新状态和爬虫完成的时间
            updateParams['finish_time'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        }
        updateParams['state'] = state;
        await this.update({
            _id:taskId
        }, {$set:updateParams});
        return;
    },
    /**
     * 根据id查询信息
     * @param {String} taskId 
     */
    queryInfoById:async function(taskId){
        var taskInfo = await this.findById(taskId).exec();
        return taskInfo;
    }
}; 
mongoose.model('CrawlerBatch', crawlerBatchSchema);