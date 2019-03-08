/*
 * @Author: zhilin.yu
 * @Date: 2018-06-05 10:34:55
 * @LastEditors: zhilin.yu
 * @LastEditTime: 2018-06-13 15:56:51
 * @Description: 模型训练机构单位
 */
'use strict';
const mongoose = require('mongoose');
const ModelTrainUnit = mongoose.model('ModelTrainUnit');
const moment = require('moment');
const resData = require('../../util/common').resData;
const log = require('../../util/logger').getLogger('system');

exports.add = async (req, res, next) => {
    let UnitName = req.body.UnitName;
    let address = req.body.address;
    let modelTrainUnit = new ModelTrainUnit({
        UnitName: UnitName, //单位名称
        address: address, //模型地址
        handRecord: [], //预留 移交记录 字段
        auditStatus: 1 //1有效 0无效
    });
    if (!req.body || !UnitName) {
        res.send(resData('-1', '参数不能为空'));
        return;
    }
    let reUnitnameAdd = await ModelTrainUnit.findByUnitName(UnitName);
    if (reUnitnameAdd) {
        res.send(resData('-1', '机构名称不能重复'));
        return;
    }
    try {
        await modelTrainUnit.save();
        res.send(resData('0', '保存成功'));
    } catch (error) {
        log.error('错误信息:', JSON.stringify(error));
        res.send(resData('-1', '保存失败'));
    }
};
exports.update = async (req, res, next) => {
    try {
        let id = req.body._id;
        let editParams = req.body;
        let modelTrainUnit = await ModelTrainUnit.findById(id);
        if (!modelTrainUnit) {
            res.send(resData('-1', '数据不存在或已被删除'));
            return false; 
        }
        if (modelTrainUnit.handRecord.length != 0) {
            res.send(resData('-1', '该机构已有数据移交，不能编辑'));
            return false; 
        }
        modelTrainUnit = Object.assign(modelTrainUnit, editParams);       
        await modelTrainUnit.save();     
        // await ModelTrainUnit.update({_id:id},{$set: editParams});
        res.send(resData('0', '编辑成功'));
    } catch (error) {
        log.error('错误信息:', JSON.stringify(error));
        if(error.code == 11000){
            res.send(resData('-1', '重复的机构名称'));
        }else{
            res.send(resData('-1', '编辑失败')); 
        }
    }
};
exports.list = async (req, res, next) => {
    try {
        let curPage = Number(req.query.curPage || 1);
        let pageSize = Number(req.query.pageSize || 20);
        let sortByUpdateTime = req.query.sortByUpdateTime || 1;
        let auditStatus = Number(req.query.auditStatus || 1);
        let beginTime = req.query.beginTime || '';
        let endTime = req.query.endTime || '';
        let pages = 0;
        let findQuery = {};
        let query = req.query.UnitName ? {
            UnitName: {
                $regex: req.query.UnitName,
                $options: 'i'
            }
        } : {};
        if (auditStatus != 2) {
            findQuery = Object.assign(query,{
                auditStatus: auditStatus 
            });
        }else{
            findQuery = Object.assign({},query);
        }
        //查询某个时间段内的更新的数据
        if (beginTime != '' && endTime != '') {
            findQuery = Object.assign(findQuery,{
                '$and': [{
                    'created': {
                        '$gt': beginTime
                    }
                }, {
                    'updated': {
                        '$lt': endTime
                    }
                }] 
            });
        }
        let count = await ModelTrainUnit.count(findQuery);
        //计算总页数
        pages = Math.ceil(count / pageSize);
        //取值不能超过pages
        curPage = Math.min(curPage, pages);
        //取值不能小于1
        curPage = Math.max(curPage, 1);
        let skip = (curPage - 1) * pageSize;
        let listQuery = {
            findQuery: findQuery,
            pageSize: pageSize,
            skip: skip,
            sortByUpdateTime: sortByUpdateTime,
            auditStatus: auditStatus,
        };
        let listData = await ModelTrainUnit.list(listQuery);
        listData.forEach(element => {
            console.log('element==', element);
            element.createdTime = moment(element.created).format('YYYY-MM-DD HH:mm:ss');
            element.updatedTime = moment(element.updated).format('YYYY-MM-DD HH:mm:ss');
        });
        log.info('返回信息:', JSON.stringify(resData));
        res.send(resData('0', '请求成功', {
            count: count,
            curPage: curPage,
            pageSize: pageSize,
            totalPages: pages,
            list: listData
        }));
    } catch (error) {
        log.info('返回错误:', JSON.stringify(error));
        res.send(resData('-1', '请求失败'));
    }
};
exports.delete = async (req, res, next) => {
    if (!req.query || !req.query._id) {
        res.send(resData('-1', '参数不能为空'));
        return;
    }
    try {
        let id = req.query._id;
        let modelTrainUnit = await ModelTrainUnit.findById(id);
        if (!modelTrainUnit) {
            res.send(resData('-1', '数据不存在或已被删除'));
            return false; 
        }
        if (modelTrainUnit.handRecord.length != 0) {
            res.send(resData('-1', '该机构已有数据移交，不能删除'));
            return false; 
        }
        await ModelTrainUnit.remove({
            _id: id
        });
        res.send(resData('0', '删除成功'));
    } catch (error) {
        log.info('返回信息:', JSON.stringify(error));
        res.send(resData('-1', '删除失败'));
    }
};