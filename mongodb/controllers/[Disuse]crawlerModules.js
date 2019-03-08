/**
 * Created by yong.li on 2018/6/21.
 * 【弃用】
 */
'use strict';
const FILES_PATH = require('../../filesPathConfigs'),
    requestConfig = require(FILES_PATH.thirdServerConfigPath).crawlerServerConfig,
    request = require('request'), 
    mongoose = require('mongoose'),
    CrawlerTask = mongoose.model('CrawlerTask'),
    tools = require('../../util/common'),
    log = require('../../util/logger').getLogger('system');
exports.createCrawlerTask = async (req,res,next)=> {
    /*
    let params = {
        id_subject : 9,
        name:'藤椒鱼',     
        websites:[{
            id_website:'53lsg23lrk43fjsn332lkent',            
            name:'bing',                  
            website_address:'https://www.bing.com',       
            require_num:6000,          
        }],
        // require_num:null,     
    };
    */
    let params = req.body;
    // if(typeof params!=='string'){
    //     res.send(tools.resData(1000,'数据格式不正确,请传递对象字符串',null));
    //     return;
    // }
    if(await tools.isEmptyObject(params)){
        res.send(tools.resData(1001,'参数不能为空',null));
        return;
    }
    if(!params.id_subject||!params.name||!params.websites||params.websites.length==0){
        res.send(tools.resData(1002,'缺少参数',null));
        return;
    }else{
        let websites = params.websites;
        for(let i=0,len=websites.length;i<len;i++){
            if(await tools.isEmptyObject(websites[i])){
                res.send(tools.resData(1003,'站点信息不能为空',null));
                return;
            }else if(!websites[i].id_website||!websites[i].name||!websites[i].website_address){
                res.send(tools.resData(1004,'站点信息不完整','originData:'+JSON.stringify(websites)));
                return;
            }
        }
    }
    try {
        /**【todo...】
         * 1.生成爬虫任务批号
         * 2.主体爬虫结果存储地址
         * 3.爬虫完成后更新爬虫完成的时间
         * 4.bug：根据状态(后期更具批次或者其他某个条件)选择的时候，cout统计应该是当前状态下的总数，目前仍然取的是所有状态总数
         */
        await CrawlerTask.create({                                 //                 是否必传            备注
            id_subject : params.id_subject,                         //                   [是]
            tasks_serial_num:null,                                  //                   [否]            后台生成
            name:params.name,                                       //                   [是]
            task_name:params.task_name?params.task_name:null,       //                   [否]            暂不做限制
            state:0,                                                //                   [否]            后台控制    
            creator:params.creator?params.creator:null,             //                   [否]
            storage_address:null,                                   //                   [否]            爬虫结束后更新字段
            websites:params.websites,                               //                   [是]           
            require_num:params.require_num?params.require_num:null, //                             
            really_num:null,                                        //                   [否]            爬虫结束后更新字段
            finish_time:null                                        //                   [否]            爬虫结束后更新字段
        });
        res.send(tools.resData(0,'success',null));
    } catch (error) {
        res.send(tools.resData(1005,'参数格式错误',error.stack));
    }
};
exports.getCrawlerTasksList = async (req,res,next)=> {
    let queryParams = req.query;
    let queryOptions = {
            queryTerms : {},
            pageInfo : {
                perPageSize:20,                 //每页默认数据：20条
                currentPage:1,                  //当前页默认：第1页
                skipSize:0                      //分页跳转个数
            },
            sort:-1                             //默认排序：按跟新时间倒叙排序
        };
    if(queryParams.name){
        queryOptions.queryTerms = Object.assign(queryOptions.queryTerms,{
            name:queryParams.name
        });
    }
    if(queryParams.state){
        if(isNaN(Number(queryParams.state))){
            res.send(tools.resData(1005,'参数格式错误',null));
            return false;
        }else{
            queryOptions.queryTerms = Object.assign(queryOptions.queryTerms,{
                state:Number(queryParams.state)
            }); 
        }
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
    let count = await CrawlerTask.count(),
        totalPages = Math.ceil(count/queryOptions.pageInfo.perPageSize);
    if(queryParams.currentPage){
        if(isNaN(Number(queryParams.currentPage))||Number(queryParams.currentPage)<1){//||Number(queryParams.currentPage)>totalPages
            res.send(tools.resData(1006,'参数错误',null));
            return false;
        }else{
            queryOptions.pageInfo.currentPage = Number(queryParams.currentPage);
        }
    }
    try {
        queryOptions.pageInfo.skipSize = queryOptions.pageInfo.perPageSize*(queryOptions.pageInfo.currentPage-1);
        let list = await CrawlerTask.list(queryOptions);
        res.send(tools.resData(0,'success',Object.assign({
            currentPage:queryOptions.pageInfo.currentPage,
            totalPages:totalPages,
            totalCount:count
        },{
            result:list
        })));
    } catch (error) {
        log.error(error);
        res.send(tools.resData(500,'fail',error.stack));
    }
};
exports.beginCrawlerTask = async (req,res,next)=>{
    /*
    let params = {
        "taskId":"1232",
        "itemNames":[
            {
                "name":"青菜",
                "subjectId":2022,
                "alias":[""]	
            }
        ],
        "websites": [                           
            {
                "url": "baidu",                         
                "count": 10                         
            },
            {
                "url": "net360",                         
                "count": 10                         
            },
            {
                "url": "bing",                         
                "count": 10                         
            }
        ]
    };
    */
    var queryParams = req.body;
    var requestUrl = requestConfig.host+requestConfig.port+requestConfig.beginCrawlerApi;
    // request('http://ip-api.com/json',function(error,result,body){
    //     console.log(error);
    //     res.send(tools.resData(0,'请求成功',result));
    // });
    if(!queryParams.taskId){
        res.send(tools.resData(1001,'确实参数',null));
        return;
    }


    request.post({
        url:requestUrl,
        headers: [
            {
              name: 'content-type',
              value: 'application/json'
            }
        ],
        form:JSON.stringify(queryParams)
    },function(error,result,body){
        if(error){
            res.send(tools.resData(500,'请求失败',error.stack));
            return;
        }
        if(result&&result.statusCode===200){
            res.send(tools.resData(result.statusCode,'请求成功',JSON.parse(body)));
            return;
        }else{
            res.send(tools.resData(result.statusCode,'请求失败',null));
            return;
        }
    });
}; 
exports.receiveCrawlerResult = async (req,res,next)=> {
    /*
    var requestData = {
        'crawlerState':1,			//爬虫状态  [Number] 0:爬虫未完成 1:爬虫完成 2:爬虫异常
        'subjectId':1322			//爬虫主体id[String]：eg：主体为"青椒肉丝"的主体id，该id是我传递给你的				
    };
    */
    var queryParams = req.body;
    if(!queryParams.crawlerState || !queryParams.subjectId){
        res.send(tools.resData(1002,'缺少crawlerState参数或subjectId参数',null));
        return;
    }
    if(isNaN(Number(queryParams.crawlerState))||(Number(queryParams.crawlerState)!==-1&&Number(queryParams.crawlerState)!==1)){
        res.send(tools.resData(1005,'参数格式错误：crawlerState参数必须是数字且取值只能为0、1、2',null));
        return;
    }
    try {
        let paramsObject = {
            crawlerState:Number(queryParams.crawlerState),
            subjectId:queryParams.subjectId
        };
        log.info('[爬虫]返回信息：'+JSON.stringify(paramsObject));
        res.send(tools.resData(0,'发送成功',null));
        return;
    } catch (error) {
        res.send(tools.resData(-1,'发送失败',error));
        return;
    }
};
