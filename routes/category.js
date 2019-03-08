'use strict';
const util = require('util'),//node模块 格式化JSON数据
    http = require('http'),
    mongo = require('../mongodb/controllers/category');

//新增分类
let addCategory  = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/addCategory 新增分类
     * @apiName addCategory
     * @apiGroup Category
     *
     * @apiParam {String} name 名字
     * @apiParam {String} level 级别
     * @apiParam {String} parentId 父级ID（当level为1时候parentId默认为1）
     *@apiParamExample {json} Request-Example:
     *{
     *    'parentId':'asasas'
     *   'level': 2,
     *   'name': '食物'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.addCategory(req,res,next);
};
//获取分类
let getCategory  = function (req,res,next) {
    /**
     * @api {get} /pic/manage/v1/getCategory 获取分类
     * @apiName getCategory
     * @apiGroup Category
     *
     * @apiSuccess {String} name  名字
     * @apiSuccess {String} level  层级
     * @apiSuccess {String} created_time  创建时间
     * @apiSuccess {String} updated_time  更新时间
     * @apiSuccess {String} id  ID
     * @apiSuccess {String} parent_id  父级ID
     * @apiSuccess {String} children  子集列表
     * @apiSuccess {String} serial_number  编号
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *        code:0,
     *        msg:'success',
     *       data: {
     *         name:'食物',
     *         level:1,
     *         id:asaxxxx,
     *         parent_id: "5b16201be64bd531a8e06fc3",
     *         created: 2018-06-05T01:44:18.215Z,
     *         updated: 2018-06-05T01:44:18.215Z,
     *         children:[
     *              {
     *                  name:'菜',
     *                  level:2,
     *                  id:dddxxxx,
     *                  parent_id: "5b16201be64bd531a8e06fc3",
     *                  created: 2018-06-05T01:44:18.215Z,
     *                  updated: 2018-06-05T01:44:18.215Z,
     *                  children:[
     *                  {
     *                      name:'川菜',
     *                      level:3,
     *                      id:zzxcs,
     *                      parent_id: "5b16201be64bd531a8e06fc3",
     *                      created: 2018-06-05T01:44:18.215Z,
     *                      updated: 2018-06-05T01:44:18.215Z
     *                  }
     *                  ]
     *              }
     *         ]
     *       }
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.getCategory(req,res,next);
};
//修改分类
let updateCategory  = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/updateCategory 修改分类
     * @apiName updateCategory
     * @apiGroup Category
     *
     * @apiParam {String} name 名字
     * @apiParam {String} id ID
     *@apiParamExample {json} Request-Example:
     *{
     *    'id':'asasas'
     *   'name': '食物'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.updateCategory(req,res,next);
};
//删除分类
let deleteCategory  = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/deleteCategory 删除分类
     * @apiName deleteCategory
     * @apiGroup Category
     *
     * @apiParam {String} id  分类ID
     *@apiParamExample {json} Request-Example:
     *{
     *    'id':'asasas'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.deleteCategory(req,res,next);
};
module.exports = {
    'GET /pic/manage/v1/getCategory':getCategory,        //获取分类
    'POST /pic/manage/v1/addCategory':addCategory ,       //新增分类
    'POST /pic/manage/v1/updateCategory':updateCategory,        //修改分类
    'POST /pic/manage/v1/deleteCategory':deleteCategory        //删除分类
};