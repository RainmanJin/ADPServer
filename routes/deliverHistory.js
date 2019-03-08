'use strict';
const mongo = require('../mongodb/controllers/deliverHistory');
const createDeliver = function(req,res,next){       
  /**
    * @api {POST} /pic/manage/v1/createDeliver 创建数据移交
    * @apiName createDeliver
    * @apiGroup DataDeliver
    * 
    * @apiParam {ArrayObject} subjects [必填]主体信息
    * @apiParam {ArrayObject} organizations [必填]机构信息
    * @apiParam {String} websites.org_id [必填]机构id
    * @apiParam {String} websites.org_name [必填]机构名称
    * @apiParam {String} creator [选填]移交者
    * 
    *@apiParamExample {json} Request-Example:
    * {
    *   "subjects":["5b46ffbb0db20363bb49b8c6","5b46ffc80db20363bb49b8c7"],
    *   "organizations":[{
    *       "org_id":"5b4c5c720db20363bb49c538",
    *       "org_name":"机构1"
    *   },{
    *       "org_id":"5b4d52920db20363bb49c550",
    *       "org_name":"机构2"
    *   }],
    *  "creator":"user"
    * }
    * @apiSuccess {Number} code  状态
    * @apiSuccess {String} msg  描述
    * @apiSuccess {Object} data  数据
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *       'code': 0,
    *       'msg': 'success',
    *       'data':null
    *     }
    *
    * @apiError 1001 参数不能为空
    * @apiError 1002 缺少主体参数或机构参数
    * @apiError 1003 主体参数或机构参数不能为空值
    * @apiError 1004 机构列表参数不完整
    * @apiError 2001 模型数据(集合)创建失败-数据格式错误或其他错误
    * @apiError 2002 序列号生成时，数据库报错
    *
    * @apiErrorExample Error-Response:
    *     HTTP/1.1 404 Not Found
    *     {
    *       'code': 1001,
    *       'msg': '参数不能为空',
    *       'data':null
    *     }
    */
    mongo.createDeliver(req,res,next);
};
const getDeliverList = function(req,res,next){
    /**
     * @api {GET} /pic/manage/v1/getDeliverList 获取数据移交记录列表
     * @apiName getDeliverList
     * @apiGroup DataDeliver
     *
     * @apiParam {String} org_name [选填]机构名称
     * @apiParam {String} start_time [选填]查询起始日期
     * @apiParam {String} end_time [选填]查询结束日期
     * @apiParam {Number} state [选填]移交数据的状态(1:训练中，2:训练完成，3:训练异常)
     * @apiParam {Number} perPageSize [选填]每页数据(默认20条)
     * @apiParam {Number} currentPage [选填]当前页数(默认第1页)
     * 
     * @apiParamExample {json} Request-Example:
     * {
     *   'org_name': '机构1',
     *   'state': 1,
     *   'perPageSize': 20,
     *   'currentPage': 1,
     *   'start_time':'2018-07-16 00:00:00',
     *   'end_time':'2018-07-16 23:59:59'
     * }
     * @apiSuccess {Number} code  状态
     * @apiSuccess {String} msg  描述
     * @apiSuccess {Object} data  数据
     *
     * @apiSuccessExample Success-Response:
     * HTTP/1.1 200 OK
     * {
     *       'code': 0,
     *       'msg': 'success',
     *       'data':{
     *          "currentPage": 1,
     *          "totalPages": 1,
     *          "totalCount": 1,
     *          "result": [{
     *              "subjects": [
     *                  "5b46ffbb0db20363bb49b8c6",
     *                  "5b46ffc80db20363bb49b8c7"
     *               ],
     *               "_id": "5b4ffd08bb5a3e39d07cbe3f",
     *               "deliver_serial_num": 1000000017,
     *               "state": 3,
     *               "organizations": [{
     *                   "_id": "5b4ffd08bb5a3e39d07cbe41",
     *                   "org_id": "5b4c5c720db20363bb49c538",
     *                   "org_name": "机构2"
     *               },
     *               {
     *                   "_id": "5b4ffd08bb5a3e39d07cbe40",
     *                   "org_id": "5b4d52920db20363bb49c550",
     *                   "org_name": "机构3"
     *               }],
     *               "creator": null,
     *               "finish_time": null,
     *               "created": "2018-07-19T02:52:56.247Z",
     *               "updated": "2018-07-19T02:52:56.247Z",
     *               "__v": 0,
     *               "create_time": "2018-07-19 10:52:56",
     *               "update_time": "2018-07-19 10:52:56"
     *          }]
     *       }
     *  }
     *
     * @apiError 1006 参数格式错误
     * @apiError 2001 数据库返回错误，数据格式错误或其他错误
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': 1006,
     *       'msg': '参数格式错误',
     *       'data':null
     *     }
     */
    mongo.getDeliverList(req,res,next);
};

const getTestSpecialType = function(req, res, next){
    mongo.getTypeList(req, res, next);
};

const createTest = function(req,res,next){
    mongo.createTest(req, res, next);
};

const postModelTestData = function(req, res, next){
    mongo.getTestRecord(req,res,next);
};

const afterMoveSubject = function(req, res, next){
    /**
    * @api {POST} /pic/manage/v1/afterMoveSubject 算法返回训练模型【注:算法使用】
    * @apiName afterMoveSubject
    * @apiGroup DataDeliver
    * 
    * @apiParam {String} batchId [必填]数据移交记录id(批次id)
    * @apiParam {String} modelPath [必填]模型地址
    * @apiParam {String} modelVersion [必填]模型版本号，目前没有这个字段
    * 
    *@apiParamExample {json} Request-Example:
    * {
    *   "batchId":"5b57ec0ecb0f6730745fff67",
    *   "modelPath":"/test/mode",
    *   "modelVersion":"xxx...",
    * }
    * @apiSuccess {Number} code  状态
    * @apiSuccess {String} msg  描述
    * @apiSuccess {Object} data  数据
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *       'code': 0,
    *       'msg': 'success',
    *       'data':null
    *     }
    *
    * @apiError 1001 参数不能为空
    * @apiError 1002 缺少batchId参数或modelPath参数或modelVersion参数
    * @apiError 2002 模型数据(集合)创建失败-数据格式错误或其他错误
    *
    * @apiErrorExample Error-Response:
    *     HTTP/1.1 404 Not Found
    *     {
    *       'code': 1001,
    *       'msg': '参数不能为空',
    *       'data':null
    *     }
    */
    mongo.afterMoveSubject(req,res,next);
};

const getTestRecordList = function(req, res,next){
    mongo.getTestRecordList(req,res,next);
};

const getTestDetailRecordList = function(req, res,next){
    mongo.getTestDetailRecordList(req, res, next);
};

const getTestPicRecordList = function(req, res, next){
    mongo.getTestPicRecordList(req, res, next);
};
module.exports = {
    'POST /pic/manage/v1/createDeliver'         : createDeliver,        //新建数据移交记录
    'GET /pic/manage/v1/getDeliverList'         : getDeliverList,       //获取数据移交记录列表
    'GET /pic/manage/v1/getTestSpecialType'     : getTestSpecialType,   //获取特殊处理类型
    'POST /pic/manage/v1/createTest'            : createTest,           //移交测试数据到算法服务器
    'POST /pic/manage/v1/postModelTestData'     : postModelTestData,    //算法测试数据回调
    'POST /pic/manage/v1/afterMoveSubject'   : afterMoveSubject,        //【对接算法-算法用回调接口】移交一批清洗完成的主体给指定的机构后的回调地址
    'GET /pic/manage/v1/getTestRecordList'      : getTestRecordList, // 获取一个批次下的主体的测试返回值
    'GET /pic/manage/v1/getTestDetailRecordList': getTestDetailRecordList, //获取主体不同处理类型的测试返回值
    'GET /pic/manage/v1/getTestPicRecordList'   : getTestPicRecordList,//获取每张图片测试返回值
};