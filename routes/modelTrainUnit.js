/*
 * @Author: zhilin.yu
 * @Date: 2018-06-04 17:09:40
 * @LastEditors: zhilin.yu
 * @LastEditTime: 2018-07-24 16:12:49
 * @Description: 
 */
'use strict';
const util = require('util'), //node模块 格式化JSON数据
    http = require('http'),
    modelTrainUnit = require('../mongodb/controllers/modelTrainUnit');

//获取模型训练机构数据
let getModelTrainUnitList = function (req, res, next) {
    modelTrainUnit.list(req, res, next);
};
//添加模型训练机构数据
let addModelTrainUnit = function (req, res, next) {
    modelTrainUnit.add(req, res, next);
};
//删除模型训练机构数据
let deleteModelTrainUnit = function (req, res, next) {
    modelTrainUnit.delete(req, res, next);
};
//编辑模型训练机构数据
let editModelTrainUnit = function (req, res, next) {
    modelTrainUnit.update(req, res, next);
};
module.exports = {
    'GET /pic/manage/v1/modelTrainUnit': getModelTrainUnitList, //获取modelTrainUnit数据列表
    'POST /pic/manage/v1/modelTrainUnit/add': addModelTrainUnit, //新增modelTrainUnit数据
    'GET /pic/manage/v1/modelTrainUnit/delete': deleteModelTrainUnit, //删除modelTrainUnit数据
    'POST /pic/manage/v1/modelTrainUnit/edit': editModelTrainUnit //编辑modelTrainUnit数据
};