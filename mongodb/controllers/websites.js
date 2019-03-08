/**
 * Created by xiaoxu.song on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const websites = mongoose.model('websites');
const Category = mongoose.model('Category');

const { resData } = require('../../util/common');
const moment = require('moment');
let log = require('../../util/logger').getLogger('system');

exports.create = (req, res, next)=> {
    let name = req.body.name || '';
    let addr = req.body.addr || '';
    let type = req.body.type || { name: '', id: ''};

    websites.find({name}, function(err, data) {
        if (data.length !== 0) {
            return res.send(resData(-1, '网站名称不能重复!'));
        } else {
            let website = new websites({
                name,
                addr,
                type,
            });
            website.save(function(err, data) {
                if (err) {
                    log.error('错误信息:',JSON.stringify(err));
                    return res.send(resData(-1, 'error'));
                }
                log.info('返回信息:','保存成功');
                return res.send(resData(0, '保存成功'));
            });
        }
    });
};

exports.delete = async (req, res, next)=> {
    var id = req.query.id;
    websites.remove({_id: id}, function (err, data) {
        if (err) {
            log.error('错误信息:',JSON.stringify(err));
            return res.send(resData(-1, 'error'));
        }
        log.info('返回信息:','删除成功');
        return res.send(resData(0, '删除成功'));
    });
};

exports.update = (req, res, next)=> {
    var id = req.body.id;
    websites.findById(id, function (err, data) {
        if (err) {
            log.error('错误信息:',JSON.stringify(err));
            res.send(resData(-1, 'error'));
        }

        if (data === null) {
            return res.send(resData(0, '站点已经删除'));
        }
        let oldName = data.name;
        data.name = req.body.name;
        data.addr = req.body.addr;
        data.type = req.body.type;

        websites.find({name: req.body.name}, function(err, docs) {
            if (docs.length !== 0 && docs[0].name !== oldName) {
                return res.send(resData(-1, '网站名称不能重复!'));
            } else {
                data.save(function (err) {
                    if (err) {
                        log.error('错误信息:',JSON.stringify(err));
                        return res.send(resData(-1, 'error'));
                    }
                    log.info('返回信息:','更新成功');
                    return res.send(resData(0, '更新成功'));
                });
            }
        });
    });
};

exports.list = async (req, res, next)=> {
    // 注：这里前端通过get方法url带参数传过来的数字会转换成字符串；
    // post方法不存在这个问题
    // 需要支持模糊搜索 { $regex: req.body.name, $options: 'i' }
    let sortByUpdateTime = parseInt(req.body.sortByUpdateTime) || -1;
    let beginTime = req.body.beginTime || '';
    let endTime = req.body.endTime || '';
    let pageSize = parseInt(req.body.pageSize) || 0; // 0表示检索所有的数据
    let curPage = parseInt(req.body.curPage) || 1;
    let totalCount = 0;
    let typeId = (req.body.typeId && req.body.typeId !== '0') ? req.body.typeId : '';
    let name = req.body.name;

    let _filter = {
        $and : [
			{
                $or: [
                    { name : { $regex: name.replace(/./g, '\\.'), $options: 'i' } },
                    { addr : { $regex: name.replace(/./g, '\\.'), $options: 'i' } }
                ]
            },
            { 'type.id' : { $regex : typeId } },
            beginTime ? { 'updated': { '$gt': beginTime } } : {},
            endTime ? { 'updated': { '$lt': endTime } } : {},
		]
    };
    websites.count(_filter, function(err, data) {
        totalCount = data;
        if ( totalCount/pageSize < curPage && (totalCount/pageSize)%1 === 0 ) {
            curPage = parseInt(totalCount/pageSize) === 0 ? 1 : parseInt(totalCount/pageSize);
        }
        if (pageSize === 0) {
            pageSize = totalCount;
        }

        let query = websites.find(_filter);
        query.sort({ updated: parseInt(sortByUpdateTime) });
        query.skip((curPage-1)*pageSize);
        query.limit(pageSize);
        query.exec(async function (err, docs) {
            if (err) {
                return res.send(resData(-1, '获取网站列表失败！'));
            }

            for (let i = 0; i < docs.length; i++) {
                docs[i].updateAt = moment(docs[i].updated).format('YYYY-MM-DD HH:mm:ss');
                docs[i].createAt = moment(docs[i].created).format('YYYY-MM-DD HH:mm:ss');
                let categoryObj = await Category.searchCategoryRoot(docs[i].type.id);
                docs[i].type.nameList = [categoryObj.level1.name, categoryObj.level2.name, categoryObj.level3.name];
            }
            return res.send(resData(0, 'success', docs, ['curPage', curPage], ['pageSize', pageSize], ['totalCount', totalCount]));
        });
    });
};