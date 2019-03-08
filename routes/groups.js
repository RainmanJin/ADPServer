/**
 * Created by yong.li on 2018/7/03.
 */
'use strict';
const mongo = require('../mongodb/controllers/groups');

let createGroup = function(req,res,next){
    /**
     * @api {POST} /pic/manage/v1/createGroup 创建组
     * @apiName createGroup
     * @apiGroup Group
     * 
     * @apiParam {String} name [必填]组名称
     * @apiParam {String} desc [必填]组描述
     * @apiParam {ArrayString} members [选填]成员id
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'name': '组1',
     *   'desc': '组1描述',
     *   'members':["4e54ed9f48dc5922c0094a42"]
     *}
     *
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
     * @apiError 1002 缺少组名或者组描述
     * @apiError 1003 数据格式错误
     * @apiError 1004 成员members字段参数不能为空值
     * @apiError 2001 模型数据(集合)创建失败-数据格式不正确或其他问题
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': 1001,
     *       'msg': '参数不能为空',
     *       'data':null
     *     }
     */
    mongo.createGroup(req,res,next);
};
let updateGroup = function(req,res,next){
    /**
     * @api {PUT} /pic/manage/v1/updateGroup 更新组
     * @apiName updateGroup
     * @apiGroup Group
     * 
     * @apiParam {String} id [必填]组id
     * @apiParam {String} name [选填]组名称
     * @apiParam {String} desc [选填]组描述
     * @apiParam {ArrayString} members [选填]成员id
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'id':'5b3f1c26dca0203cac72c018',    
     *   'name': '组1',
     *   'desc': '组1描述',
     *   'members':[]
     *}
     *
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
     * @apiError -1 [后台交互]-更新成员信息失败
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
    mongo.updateGroup(req,res,next);
};
let removeMemberOfGroup = function(req,res,next){
    /**
     * @api {PUT} /pic/manage/v1/removeMemberOfGroup 移除组中的单个成员
     * @apiName removeMemberOfGroup
     * @apiGroup Group
     * 
     * @apiParam {String} id [必填]组id
     * @apiParam {String} userId [选填]用户id名称
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'id':'5b3f1c26dca0203cac72c018',    
     *   'userId':'5b3de122b6e6920d941c5da3',
     *}
     *
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
     * @apiError 1002 缺少参数
     * @apiError 2001 数据库返回的错误,数据格式不正确或其他问题
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': 1002,
     *       'msg': '缺少参数',
     *       'data':null
     *     }
     */
    mongo.removeMemberOfGroup(req,res,next);
};
let getGroupList = function(req,res,next){
    /**
     * @api {GET} /pic/manage/v1/getGroupList 获取组列表
     * @apiName getGroupList
     * @apiGroup Group
     *
     * @apiParam {String} name [选填]组名称
     * @apiParam {Number} sort [选填]排序(-1:倒序--默认，1:正序)
     * @apiParam {Number} perPageSize [选填]每页数据(默认20条)
     * @apiParam {Number} currentPage [选填]当前页数(默认第1页)
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'name': '',
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
     *              "members": [],
     *              "_id": "5b3f2385417f9e37a0c47dfd",
     *              "name": "组2",
     *              "desc": "组2描述",
     *              "created": "2018-07-06T08:08:37.491Z",
     *              "updated": "2018-07-06T08:27:21.441Z",
     *              "__v": 0,
     *              "create_time": "2018-07-06 16:08:37",
     *              "update_time": "2018-07-06 16:27:21"
     *          }]
     *        }
     *      }
     *
     * @apiError 1005 参数格式错误
     * @apiError 1006 参数错误
     * @apiError 2001 数据库返回错误，数据个数错误或其他错误
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': 1005,
     *       'msg': '参数格式错误',
     *       'data':null
     *     }
     */
    mongo.getGroupList(req,res,next);
};
let getGroup = function(req,res,next){
    /**
     * @api {GET} /pic/manage/v1/getGroup 获取组详情
     * @apiName getGroup
     * @apiGroup Group
     *
     * @apiParam {String} id [必填]组id
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'id': '5b3f1c26dca0203cac72c018',
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
     *          "members": [],
     *           "_id": "5b3f1c26dca0203cac72c018",
     *          "name": "test",
     *           "desc": "noting",
     *           "created": "2018-07-06T07:37:10.251Z",
     *           "updated": "2018-07-06T08:25:03.620Z",
     *           "__v": 0,
     *           "create_time": "2018-07-06 15:37:10",
     *           "update_time": "2018-07-06 16:25:03"         
     *        }
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
    mongo.getGroup(req,res,next);
};
let deleteGroup = function(req,res,next){
    /**
     * @api {DELETE} /pic/manage/v1/deleteGroup 删除组
     * @apiName deleteGroup
     * @apiGroup Group
     *
     * @apiParam {String} id [必填]组id
     * 
     *@apiParamExample {json} Request-Example:
     *{
     *   'id': '5b3f1c26dca0203cac72c018',
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
     *       'data':null
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
    mongo.deleteGroup(req,res,next);
};
module.exports = {
    'POST /pic/manage/v1/createGroup'          : createGroup,          //新建组
    'PUT /pic/manage/v1/updateGroup'           : updateGroup,          //更新组
    'PUT /pic/manage/v1/removeMemberOfGroup'   : removeMemberOfGroup,  //更新组
    'GET /pic/manage/v1/getGroupList'          : getGroupList,         //获取组列表
    'GET /pic/manage/v1/getGroup'              : getGroup,             //获取组详情
    'DELETE /pic/manage/v1/deleteGroup'        : deleteGroup,          //删除组
};