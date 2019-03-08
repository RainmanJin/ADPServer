'use strict';
const mongo = require('../mongodb/controllers/crawlerBatchTask');
let createCrawlerBatch = function(req,res,next){
    /**
     * @api {POST} /pic/manage/v1/createCrawlerBatch 创建爬虫任务
     * @apiName createCrawlerBatch
     * @apiGroup CrawlerTask
     * 
     * @apiParam {String} name [选填]爬虫任务名
     * @apiParam {ArrayObject} subjects [必填]主体信息
     * @apiParam {String} subjects.id_subject [必填]主体id
     * @apiParam {String} subjects.name [必填]主体名称
     * @apiParam {ArrayString} subjects.alias [必填]主体别名
     * @apiParam {ArrayObject} websites [必填]网站信息
     * @apiParam {String} websites.id_website [必填]网站id
     * @apiParam {String} websites.name [必填]网站名称
     * @apiParam {Number} websites.require_num [必传]爬虫数量
     * @apiParam {String} creator [选填]创建者
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'name': '第1批次',
     *   'subjects':[
     *      {
     *          'id_subject':'5b306100f906d9333c6423cc',
     *          'name':"西红谢谢柿3",
     *          'alias':["aaa","bbb"]
	 *	    }
     *   ],
     *   'websites': [{
     *      'id_website':'5b29e33fad7943498a9886ad',
     *      'name':'baidu',
     *      'website_address':'https://www.baidu.com',
     *      'require_num':6000
     *   }],
     * 	"creator":"qiang.zhang"
     *}
     * @apiSuccess {Number} code  状态
     * @apiSuccess {String} msg  描述
     * @apiSuccess {Object} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0,
     *       'msg': '添加爬虫任务成功',
     *       'data':null
     *     }
     *
     * @apiError 1001 参数不能为空
     * @apiError 1002 缺少参数
     * @apiError 1003 主体列表不能为空||站点信息不能为空
     * @apiError 1004 主体信息不完整||站点信息不完整
     * @apiError 1005 参数格式错误
     * @apiError 1006 参数错误
     * @apiError 2001 模型数据(集合)创建失败-数据库数据自动校验失败
     * @apiError 500 服务器错误
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': 1001,
     *       'msg': '参数不能为空',
     *       'data':null
     *     }
     */
    mongo.createCrawlerBatch(req,res,next);
};
let getCrawlerBatchList = function(req,res,next){
    /**
     * @api {GET} /pic/manage/v1/getCrawlerBatchList 获取爬虫任务列表
     * @apiName getCrawlerBatchList
     * @apiGroup CrawlerTask
     *
     * @apiParam {String} name [选填]主体名称
     * @apiParam {Number} state [选填]任务状态(1:未启动，2:进行中，3：完成)
     * @apiParam {Number} sort [选填]排序(-1:倒序--默认，1:正序)
     * @apiParam {Number} perPageSize [选填]每页数据(默认20条)
     * @apiParam {Number} currentPage [选填]当前页数(默认第1页)
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'name': '第1批次',
     *   'state': 0,
     *   'sort': -1,
     *   'perPageSize': 20,
     *   'currentPage': 1
     *}
     * @apiSuccess {Number} code  状态
     * @apiSuccess {String} msg  描述
     * @apiSuccess {Object} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0,
     *       'msg': 'success',
     *       'data':{
     *          "currentPage": 2,
     *          "totalPages": 3,
     *          "totalCount": 8,
     *          "result": [{
     *              "_id": "5b30cb790ff449378c4de93e",
     *              "batch_serial_num": null,
     *               "name": "第1批次",
     *               "count": 1,
     *               "state": 1,
     *               "subjects": [
     *                   {
     *                       "_id": "5b30cb790ff449378c4de93f",
     *                       "id_subject": "sgwg",
     *                       "name": "鱼香肉丝"
     *                   }
     *               ],
     *               "websites": [
     *                   {
     *                       "_id": "5b30cb790ff449378c4de940",
     *                       "id_website": "jlsfje",
     *                       "name": "baidu",
     *                       "website_address": "https://www.baidu.com/",
     *                       "require_num": 500,
     *                       "real_num": 365
     *                   }
     *               ],
     *               "creator": "yong.li",
     *               "finish_time": null,
     *               "created": "2018-06-25T11:01:13.869Z",
     *               "updated": "2018-06-26T03:12:41.002Z",
     *               "__v": 0
     *               }]
     *          }
     *      }
     *
     * @apiError 1001 参数不能为空
     * @apiError 1002 缺少参数
     * @apiError 1003 主体列表不能为空||站点信息不能为空
     * @apiError 1004 主体信息不完整||站点信息不完整
     * @apiError 1005 参数格式错误
     * @apiError 1006 参数错误
     * @apiError 500 服务器错误
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': 1001,
     *       'msg': '参数不能为空',
     *       'data':null
     *     }
     */
    mongo.getCrawlerBatchList(req,res,next);
};
let getCrawlerBatch = function(req,res,next){
    /**
     * @api {GET} /pic/manage/v1/getCrawlerBatch 获取单个爬虫任务
     * @apiName getCrawlerBatch
     * @apiGroup CrawlerTask
     *
     * @apiParam {String} id [必填]主体id
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'id': '5b33254635007d444a91e0c5',
     *}
     * @apiSuccess {Number} code  状态
     * @apiSuccess {String} msg  描述
     * @apiSuccess {Object} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0,
     *       'msg': 'success',
     *       'data':{
    *              "_id": "5b30cb790ff449378c4de93e",
    *              "batch_serial_num": null,
    *               "name": "第1批次",
    *               "count": 1,
    *               "state": 1,
    *               "subjects": [
    *                   {
    *                       "_id": "5b30cb790ff449378c4de93f",
    *                       "id_subject": "sgwg",
    *                       "name": "鱼香肉丝"
    *                   }
    *               ],
    *               "websites": [
    *                   {
    *                       "_id": "5b30cb790ff449378c4de940",
    *                       "id_website": "jlsfje",
    *                       "name": "baidu",
    *                       "website_address": "https://www.baidu.com/",
    *                       "require_num": 500,
    *                       "real_num": 365
    *                   }
    *               ],
    *               "creator": "yong.li",
    *               "finish_time": null,
    *               "created": "2018-06-25T11:01:13.869Z",
    *               "updated": "2018-06-26T03:12:41.002Z",
    *               "__v": 0
     *          }
     *      }
     *
     * @apiError 1002 缺少参数
     * @apiError 2001 数据库返回的错误,数据格式不正确
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': 1002,
     *       'msg': '缺少参数',
     *       'data':null
     *     }
     */
    mongo.getCrawlerBatch(req,res,next);
};
let beginCrawlerTask = function(req,res,next){
  /**
    * @api {POST} /pic/manage/v1/beginCrawlerTask 启动爬虫任务
    * @apiName beginCrawlerTask
    * @apiGroup CrawlerTask
    *
    * @apiParam {String} taskId [必填]主体id
    * @apiParam {ArrayObject} itemNames [必填]主体信息
    * @apiParam {String} itemNames.subjectId [必填]主体id
    * @apiParam {String} itemNames.name [必填]主体名称
    * @apiParam {ArrayString} itemNames.alias [选填]主体别名
    * @apiParam {ArrayObject} websites [必填]网站信息
    * @apiParam {String} websites.url [必填]网站id
    * @apiParam {Number} websites.count [必填]爬虫数量
    * 
    *@apiParamExample {json} Request-Example:
    *   {
    *       "taskId":"5b30cbaa0ff449378c4de941",
    *       "itemNames":[
    *           {
    *               "name":"青菜",
    *               "subjectId":"5b2cc862f906d91f800c58d3",
    *               "alias":[]	
    *           }
    *       ],
    *       "websites": [                           
    *           {
    *               "url": "baidu",                         
    *               "count": 56                         
    *           },
    *           {
    *               "url": "net360",                         
    *               "count": 10                         
    *           }
    *       ]
    *   }
    * @apiSuccess {Number} code  状态
    * @apiSuccess {String} msg  描述
    * @apiSuccess {Object} data  数据
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *       "code": 0,
    *      "msg": "爬虫任务启动成功",
    *       "data": {
    *           "code": 1,
    *           "msg": "成功获取到爬虫任务",
    *           "taskId": "5b30cbaa0ff449378c4de941"
    *       }
    *   }
    *
    * @apiError 1001 参数不能为空
    * @apiError 1002 缺少参数
    * @apiError 1003 主体列表不能为空||站点信息不能为空
    * @apiError 1004 主体信息不完整||站点信息不完整
    * @apiError 1005 参数格式错误
    * @apiError 1006 参数错误
    * @apiError 3001 爬虫任务启动失败
    * @apiError 500 服务器错误
    *
    * @apiErrorExample Error-Response:
    *     HTTP/1.1 404 Not Found
    *     {
    *       'code': 1001,
    *       'msg': '参数不能为空',
    *       'data':null
    *     }
    */
    mongo.beginCrawlerTask(req,res,next);
};
let receiveCrawlerResult = function(req,res,next){
   /**
    * @api {POST} /pic/manage/v1/receiveCrawlerResult 爬虫通知后端爬虫结果【注：爬虫使用】
    * @apiName receiveCrawlerResult
    * @apiGroup CrawlerTask
    *
    * @apiParam {Number} crawlerState [必填]爬虫状态(-1:爬虫未完成,1:爬虫完成)
    * @apiParam {String} subjectId [必填]主体id
    * 
    *@apiParamExample {json} Request-Example:
    *   {
    *       "crawlerState":1,
    *       "subjectId":"5b2cc862f906d91f800c58d3"
    *   }
    * @apiSuccess {Number} code  状态
    * @apiSuccess {String} msg  描述
    * @apiSuccess {Object} data  数据
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *       "code": 0,
    *       "msg": "当前爬虫状态已收到",
    *       "data": null
    *   }
    *
    * @apiError 1002 缺少crawlerState参数或subjectId参数
    * @apiError 1005 参数格式错误：crawlerState参数必须是数字且取值只能为-1或1
    *
    * @apiErrorExample Error-Response:
    *     HTTP/1.1 404 Not Found
    *     {
    *       'code': 1002,
    *       'msg': '缺少crawlerState参数或subjectId参数',
    *       'data':null
    *     }
    */
    mongo.receiveCrawlerResult(req,res,next);
};
module.exports = {
    'POST /pic/manage/v1/createCrawlerBatch'     : createCrawlerBatch,       //新建爬虫批次任务
    'GET /pic/manage/v1/getCrawlerBatchList'     : getCrawlerBatchList,      //获取爬虫批次列表
    'GET /pic/manage/v1/getCrawlerBatch'         : getCrawlerBatch,          //获取爬虫批次(id)
    'POST /pic/manage/v1/beginCrawlerTask'       : beginCrawlerTask,         //【对接爬虫:前端用】开始爬虫任务
    'POST /pic/manage/v1/receiveCrawlerResult'   : receiveCrawlerResult      //【对接爬虫:爬虫用】返回爬虫状态
};