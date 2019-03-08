/**
 * Created by yong.li on 2018/6/25.
 */
'use strict';
const FILES_PATH = require('../../filesPathConfigs'),
    requestConfig = require(FILES_PATH.thirdServerConfigPath).crawlerServerConfig,
    util = require('util'),
    request = require('request'), 
    mongoose = require('mongoose'),
    CrawlerTask = mongoose.model('CrawlerBatch'),
    SerialNumber = mongoose.model('SerialNumber'),
    moment = require('moment'),
    tools = require('../../util/common'),
    log = require('../../util/logger').getLogger('system');

const mainBody = require('./mainBody'),
    picResources = require('./picResources');
/**
 * 创建爬虫批次任务
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.createCrawlerBatch = async (req,res,next)=> {
    let params = req.body;
    if(await tools.isEmptyObject(params)){
        res.send(tools.resData(1001,'参数不能为空',null));
        return;
    }
    if(!params.subjects||!params.websites){
        res.send(tools.resData(1002,'缺少参数',null));
        return; 
    }else if(params.subjects.length==0||params.websites.length==0){
        res.send(tools.resData(1004,'主体列表或网站列表不能为空值',null));
        return;
    }else{
        var subjects = params.subjects,
            websites = params.websites;
        for(let i=0,len=subjects.length;i<len;i++){
            if(await tools.isEmptyObject(subjects[i])){
                res.send(tools.resData(1003,'主体列表不能为空',null));
                return;
            }else if(!subjects[i].id_subject||!subjects[i].name||!subjects[i].alias){
                res.send(tools.resData(1004,'主体信息不完整','originData:'+JSON.stringify(subjects)));
                return;
            }
        }
        for(let i=0,len=websites.length;i<len;i++){
            if(await tools.isEmptyObject(websites[i])){
                res.send(tools.resData(1003,'站点列表不能为空',null));
                return;
            }else if(!websites[i].id_website||!websites[i].name||!websites[i].website_address||(null==websites[i].require_num)||(undefined==websites[i].require_num)){
                res.send(tools.resData(1004,'站点信息不完整','originData:'+JSON.stringify(websites)));
                return;
            }
        }
    }
    try {
        var serialNumber = null;
        let isExist =  await SerialNumber.find({name: 'task_batch_serial'}).exec();
        if(isExist.length<1){
            serialNumber = 1000000001;
            await SerialNumber.create({name: 'task_batch_serial',value:serialNumber});
        }else {
            serialNumber = isExist[0].value +1;
            await SerialNumber.update({name: 'task_batch_serial'}, {$set: {value:serialNumber}});
        }
    } catch (error) {
        res.send(tools.resData(2002,'序列号生成时，数据库报错','错误信息:'+JSON.stringify(error.stack)));
        return;
    }
    try {
        var createCrawlerTask = await CrawlerTask.create({               //                 是否必传            备注
            batch_serial_num:serialNumber?serialNumber:null,            //                   [否]            后台生成
            name:params.name?params.name:null,                          //                   [否]
            count:params.subjects.length,                               //                   [否]            暂不做限制
            state:1,                                                    //                   [否]            后台控制：1:未启动，2:进行中，3：完成 
            subjects:params.subjects,                                   //                   [是]
            websites:params.websites,                                   //                   [是]
            creator:params.creator?params.creator:null,                 //                   [否]
            finish_time:null,                                           //                   [否]            爬虫结束后更新字段
        });
        if(createCrawlerTask.id){
            let idSubjectsArray = [],
                totalNum = 0;
            websites.forEach((_item,_index) => {
                totalNum+=parseInt(_item.require_num);
                _item = Object.assign(_item,{'real_num':null});
            });
            subjects.forEach((_item,_index) => {
                idSubjectsArray.push({
                    id:_item.id_subject,
                    idTask:createCrawlerTask.id,
                    totalCrawler:totalNum,
                    taskStatus:1,
                    websites:websites
                });
            });
            /**
             * 【更新主体表】:创建任务后，更新[主体表]中主体的状态(eg:taskid/taskstatus/websites/totalCrawler...等)
             * @param {ObjectArray} idSubjectsArray
             */
            var addTaskResult = await mainBody.addTaskId(idSubjectsArray);
            if(addTaskResult.code===0){
                res.send(tools.resData(0,'添加爬虫任务成功',null));
                return;
            }else{
                res.send(tools.resData(-1,'内部更新主体任务id字段出现错误',null));
                return;
            }
        }
    } catch (error) {
        res.send(tools.resData(2001,'模型数据(集合)创建失败','数据格式验证失败:'+error.stack));
        return;
    }
};
/**
 * 获取爬虫批次任务列表
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getCrawlerBatchList = async (req,res,next)=> {
    let queryParams = req.query;
    let queryOptions = {
            filter:{},
            queryTerms : {
                name:'',
                state:''
            },
            pageInfo : {
                perPageSize:20,                 //每页默认数据：20条
                currentPage:1,                  //当前页默认：第1页
                skipSize:0                      //分页跳转个数
            },
            sort:-1                             //默认排序：按跟新时间倒叙排序
        };
    queryOptions.queryTerms.name = queryParams.name?queryParams.name:'';
    if(queryParams.state){
        if(isNaN(Number(queryParams.state))){
            res.send(tools.resData(1005,'参数格式错误',null));
            return false;
        }else{
            queryOptions.queryTerms.state = Number(queryParams.state);
        }
    }else{
        queryOptions.queryTerms.state = '';
    }
    if(queryParams.sort){
        if(isNaN(Number(queryParams.sort))||(Number(queryParams.sort)!==-1&&Number(queryParams.sort)!==1)){
            res.send(tools.resData(1005,'参数格式错误',null));
            return false;
        }else{
            queryOptions.sort = Number(queryParams.sort); 
        }
    }
    if(queryParams.perPageSize){
        if(isNaN(Number(queryParams.perPageSize))||Number(queryParams.perPageSize)<1){
            res.send(tools.resData(1006,'参数错误',null));
            return false;
        }else{
            queryOptions.pageInfo.perPageSize = Number(queryParams.perPageSize);
        }
    }
    if(queryParams.currentPage){
        if(isNaN(Number(queryParams.currentPage))||Number(queryParams.currentPage)<1){//||Number(queryParams.currentPage)>totalPages
            res.send(tools.resData(1006,'参数错误',null));
            return false;
        }else{
            queryOptions.pageInfo.currentPage = Number(queryParams.currentPage);
        }
    }
    try {
        let _filter = {
            $and: [
                ''!=queryOptions.queryTerms.name?{name: {$regex: queryOptions.queryTerms.name, $options: 'i'}}:{},
                ''!=queryOptions.queryTerms.state?{state: queryOptions.queryTerms.state}:{}
            ]
        };    
        queryOptions.filter = _filter;
        let count = await CrawlerTask.count(queryOptions.filter).exec(),
            totalPages = Math.ceil(count/queryOptions.pageInfo.perPageSize);
        queryOptions.pageInfo.skipSize = queryOptions.pageInfo.perPageSize*(queryOptions.pageInfo.currentPage-1);
        let list = await CrawlerTask.list(queryOptions);
        list.forEach(function($item,$index){
            $item.create_time = moment($item.created).format('YYYY-MM-DD HH:mm:ss');
            $item.update_time = moment($item.updated).format('YYYY-MM-DD HH:mm:ss');
        });
        res.send(tools.resData(0,'success',Object.assign({
            currentPage:queryOptions.pageInfo.currentPage,
            totalPages:totalPages,
            totalCount:count
        },{
            result:list
        })));
        return;
    } catch (error) {
        res.send(tools.resData(500,'fail',error.stack));
        return;
    }
};
/**
 * 获取单个爬虫批次任务
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getCrawlerBatch = async (req,res,next)=> {
    let queryParams = req.query;
    if(!queryParams.id){
        res.send(tools.resData(1002,'缺少参数',null));
        return; 
    }
    try {
        var result = await CrawlerTask.queryInfoById(queryParams.id);
        result.create_time = moment(result.created).format('YYYY-MM-DD HH:mm:ss');
        result.update_time = moment(result.updated).format('YYYY-MM-DD HH:mm:ss');
        res.send(tools.resData(0,'success',result));
        return;
    } catch (error) {
        res.send(tools.resData(3001,'数据库返回的错误,数据格式不正确',error.stack));
        return;
    }
};
/**
 * [前端用]开始批次爬虫任务:向爬虫下发爬虫指令
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.beginCrawlerTask = async (req,res,next)=>{
    var params = req.body;
    if(await tools.isEmptyObject(params)){
        res.send(tools.resData(1001,'参数不能为空',null));
        return;
    }
    if(!params.taskId||!params.itemNames||!params.websites){
        res.send(tools.resData(1002,'缺少参数',null));
        return; 
    }else if(params.itemNames.length==0||params.websites.length==0){
        res.send(tools.resData(1004,'主体列表或网站列表不能为空值',null));
        return;
    }else{
        var subjects = params.itemNames,
            websites = params.websites;
        for(let i=0,len=subjects.length;i<len;i++){
            if(await tools.isEmptyObject(subjects[i])){
                res.send(tools.resData(1003,'主体列表不能为空',null));
                return;
            }else if(!subjects[i].subjectId||!subjects[i].name||(subjects[i].alias&&!util.isArray(subjects[i].alias))){
                res.send(tools.resData(1004,'主体信息不完整','originData:'+JSON.stringify(subjects)));
                return;
            }
        }
        for(let i=0,len=websites.length;i<len;i++){
            if(await tools.isEmptyObject(websites[i])){
                res.send(tools.resData(1003,'站点列表不能为空',null));
                return;
            }else if(!websites[i].url||(null==websites[i].count)||(undefined==websites[i].count)){
                res.send(tools.resData(1004,'站点信息不完整','originData:'+JSON.stringify(websites)));
                return;
            }
        }
    }
    try {
        //已启动的爬虫任务不能再次启动
        let taskInfo = await CrawlerTask.queryInfoById(params.taskId);
        if(taskInfo&&taskInfo.state!==1){
            res.send(tools.resData(3002,'爬虫任务已启动或已完成',null));
            return;
        }
    } catch (error) {
        res.send(tools.resData(3001,'爬虫任务启动失败-taskId不合法',JSON.stringify(error.stack)));
        return;
    }
    //调用爬虫命令
    var requestUrl = requestConfig.host+requestConfig.beginCrawlerApi;
    request({ 
        url: requestUrl, 
        method: 'POST', 
        json: true, 
        headers: { 'content-type': 'application/json', }, 
        body: params
    },async function(error, result, body) { 
        if(error){
            res.send(tools.resData(3001,'爬虫任务启动失败-1',error.stack));
            return;
        }
        if(result&&result.statusCode===200){
            if(body.code===1){
                /**
                 * 【更新主体表】:更新主体表中该任务下所有主体的任务状态为--正在爬虫
                 * @param {Object} 
                 */
                let updateMainBodyResult = await mainBody.updateMainBodyOfSpider({
                    taskId:body.taskId,
                    taskStatus:2
                });
                if(updateMainBodyResult.code!==0){
                    res.send(tools.resData(3001,'爬虫任务启动失败-2-'+updateMainBodyResult.msg,null));
                    return;
                }
                /**
                 * 【更新爬虫任务表】:更新爬虫批次任务的状态为--正在爬虫
                 * @param {String} taskId
                 */
                await CrawlerTask.updateCrawlerBatchState(body.taskId,2);
                res.send(tools.resData(0,'爬虫任务启动成功',body));
                return;
            }else{
                res.send(tools.resData(3001,'爬虫任务启动失败-3',result));
                return;
            }
        }else{
            res.send(tools.resData(3001,'爬虫任务启动失败-4',null));
            return;
        }
    });
};
/**
 * [爬虫用]爬虫通知后台爬虫任务结果
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.receiveCrawlerResult = async (req,res,next)=> {
    //todo...
    /**待优化
     * 1.如果有10个主体爬虫那边都完成了，而后台服务挂掉了，在服务重启后应该如何将完成了的爬虫主体的数据请求回来
     */

    var queryParams = req.body;
    if(!queryParams.crawlerState || !queryParams.subjectId){
        res.send(tools.resData(1002,'缺少crawlerState参数或subjectId参数',null));
        return;
    }
    if(null===queryParams.isLast||undefined===queryParams.isLast){
        res.send(tools.resData(1003,'缺少isLast参数',null));
        return;
    }
    if(isNaN(Number(queryParams.crawlerState))){
        res.send(tools.resData(1005,'参数格式错误：crawlerState参数必须是数字且取值只能为-1或1',null));
        return;
    }
    let paramsObject = {
        crawlerState:Number(queryParams.crawlerState),  //爬虫状态   [Number] -1:爬虫未完成 1:爬虫完成
        subjectId:queryParams.subjectId,                //爬虫主体id [String]
        isLast:queryParams.isLast                         //批次任务是否完成
    };
    res.send(tools.resData(0,'当前主体的爬虫状态已收到',JSON.stringify(paramsObject)));
    //获取当前主体下的任务信息
    let $subjectInfo = await mainBody.getTaskIdById(paramsObject.subjectId);
    if($subjectInfo.code!==0){
        log.error('[爬虫请求后台]-请求后台失败:'+$subjectInfo.msg);
        return; 
    }
    
    //如果爬虫状态不是1(即完成),则不进行数据请求
    if(paramsObject.crawlerState!==1){
        /** 
         * 【更新任务表-内部调用】:爬取主体失败后
         * 1.爬虫完成后更新爬虫完成的时间
         * @param {} 
         */
        if(paramsObject.isLast === '1' || paramsObject.isLast === 1){
            try {
                await CrawlerTask.updateCrawlerBatchState($subjectInfo.data.id_task,3);
                log.info('[爬虫<-->任务表]_主体爬取异常_更新`任务表`成功！');
            } catch (error) {
                log.error('[爬虫<-->任务表]_主体爬取异常_更新`任务表`失败_error_4:'+JSON.stringify(error.stack));
            }
        }
        /**
         * 【更新主体表-内部调用】:爬虫返回主体的错误信息后应该更新主体为爬虫完成，虽然无数据；
         * 1.在爬虫端如果返回错误状态，后台应该通知主题表更新出错主体的状态为爬虫完成
         */
        let $updateData1 = {
            'subjectId': paramsObject.subjectId,
            'absAddress': '',
            'saveAddress': '',
            'websites': []
        };
        let updateMainBodyResult = await mainBody.updateMainBodyAfterSpider($updateData1);
        if(updateMainBodyResult.code!==0){
            log.error('[爬虫<-->主体表]_主体爬取异常_-更新`主体表`失败_error_1:'+updateMainBodyResult.msg);
            return;
        }
        log.warn('[爬虫<-->主体表]_主体爬取异常_-更新`主体表`成功：返回信息--crawlerState:'+paramsObject.crawlerState);
        return;
    }
    try {
        /**
         * 根据返回的结果去获取爬虫的结果
         */
        let requestUrl = requestConfig.host+requestConfig.getCrawlerResultApi;
        request({ 
            url: requestUrl, 
            method: 'POST', 
            json: true, 
            headers: { 'content-type': 'application/json'}, 
            body: {
                subjectId:paramsObject.subjectId
            }
        },async function(error, result, body) { 
            if(error){
                log.error('[后台请求爬虫]返回信息-请求爬虫资源失败-1：'+JSON.stringify(error.stack));
                return;
            }
            if(!body.code||body.code!=='1'){
                log.error('[后台请求爬虫]返回信息-请求爬虫资源失败-2：'+JSON.stringify(result));
                return;
            }
            if(body.data&&body.data.subjectId){
                log.info('[后台请求爬虫]返回信息-请求爬虫资源成功：'+JSON.stringify(body));
                let $result = body.data;
                
                /**
                 * 【更新主体表-内部调用】:获取到爬虫图片资源后，更新以下信息
                 * 1.更新主题表中当前主体资源的文件存储地址
                 * 2.更新各个网站爬虫的真实数量统计
                 * 3.更新主体的状态
                 * @param {Object} $updateData1
                 */
                let $websites = [];
                $result.source.forEach(function(_item,_index){
                    $websites.push({
                        'real_num': _item.count,
                        'name': _item.fileName,
                    });
                });
                let $updateData1 = {
                    'subjectId': $result.subjectId,
                    'absAddress': $result.absAddress,
                    'saveAddress': $result.saveAddress,
                    'websites': $websites
                };
                var updateMainBodyResult = await mainBody.updateMainBodyAfterSpider($updateData1);
                if(updateMainBodyResult.code!==0){
                    log.error('[爬虫<-->主体表]_主体爬取正常_更新`主体表`失败_error_2:'+updateMainBodyResult.msg);
                    return;
                }
                log.info('[爬虫<-->主体表]_主体爬取正常_更新`主体表`成功！');
                /** 
                 * 【更新任务表-内部调用】:获取到爬虫图片资源后
                 * 1.爬虫完成后更新爬虫完成的时间
                 * @param {} 
                 */
                if(paramsObject.isLast === '1' ||paramsObject.isLast === 1){
                    try {
                        await CrawlerTask.updateCrawlerBatchState($subjectInfo.data.id_task,3);
                        log.info('[爬虫<-->任务表]_主体爬取正常_更新`任务表`成功！');
                    } catch (error) {
                        log.error('[爬虫<-->任务表]_主体爬取正常_更新`任务表`失败_error_3:'+JSON.stringify(error.stack));
                    }
                }
                /**
                 * 【追加资源表-内部调用】:保存图片到资源库
                 * @param {Object} data
                 */
                try {
                    let addPicResult = await picResources.addPicResources(Object.assign({
                        taskId:$subjectInfo.data.id_task
                    },body.data));
                    if(addPicResult.code!==0){
                        log.error('[爬虫<-->资源表]_主体爬取正常_入库`资源表`失败:'+result.msg);
                        return;
                    }
                    log.info('[爬虫<-->资源表]_主体爬取正常_入库`资源表`成功!');
                    return;
                } catch (error) {
                    log.error('[爬虫<-->资源表]_主体爬取正常_入库`资源表`失败:'+JSON.stringify(error.stack));
                    return;
                }
                
            }else{
                log.error('[后台请求爬虫]返回信息-请求爬虫资源失败-3：'+JSON.stringify(result));
                return;
            }
        });
    } catch (error) {
        res.send(tools.resData(-1,'发送失败',error));
        return;
    }
};

