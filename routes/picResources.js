/*
 * @Author: jiapei.qiu 
 */
'use strict';
const picResources = require('../mongodb/controllers/picResources');

let getPicResources = function (req, res, next) {
  picResources.getPicResourcesFromDb(req, res, next);
};

let uploadPicStatus = function (req, res, next) {
  picResources.uploadPicStatus(req, res, next);
};

let afterFilterSubject = function (req, res, next) {
  picResources.afterFilterSubject(req, res, next);
};

let picCopyToAlgorithm = function (req, res, next) {
  picResources.picCopyToAlgorithm(req, res, next);
};

module.exports = {
  'GET /pic/manage/v1/pictureList': getPicResources,
  'POST /pic/manage/v1/uploadPicStatus': uploadPicStatus,
  'POST /pic/manage/v1/afterFilterSubject':afterFilterSubject,   //【对接算法】：算法清洗完成，更新资源表的资源状态
  'POST /pic/manage/v1/picCopyToAlgorithm': picCopyToAlgorithm,
};