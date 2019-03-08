/**
 * Created by yong.li on 2018/6/21.
 * 【弃用】
 */
'use strict';
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment');

const crawlerTaskSchema = new Schema({
    id_batch:String,                            //任务批次id[预留字段]
    id_subject:String,                          //主体id
    tasks_serial_num: String,                   //任务id
    name:String,                                //主体名称
    task_name:String,                           //任务名称
    state:{ type: Number, min: 0, max: 3 },     //任务状态  0:未启动, 1:正在爬虫, 2:爬虫完成 3:已终止
    creator:String,                             //创建者
    storage_address:String,                     //存储地址 eg:'\\172.17.245.78\\pic\\output_pic\\V1.0.0.0508.1'
    websites:[{
        id_website:String,                      //网站id
        name:String,                            //网站名称
        website_address:String,                 //网站网址
        require_num:Number,                     //单个网站爬虫要求数量
        really_num:Number,                      //单个网站爬虫实际数量
    }],
    require_num:Number,                         //单个主体爬虫要求数量 
    really_num:Number,                          //单个主体爬虫实际数量
    finish_time:String                          //爬虫完成时间
},{
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});
crawlerTaskSchema.pre('save', function (next) {
    next();
});
crawlerTaskSchema.methods = {
    updateAndSave: function () {
        return this.save();
    }
};
crawlerTaskSchema.statics = {
    //查询数据
    list:async function (options) {
        var p = options.queryTerms;
        let queryResult = await this.find(options.queryTerms).sort({
            updated: options.sort
        })
        .limit(options.pageInfo.perPageSize)
        .skip(options.pageInfo.skipSize)
        .exec();
        return queryResult;
    },
};
mongoose.model('CrawlerTask', crawlerTaskSchema);