'use strict';
let websites = require('../mongodb/controllers/websites');

// 新增网站信息
let createWebsite = function(req, res, next) {
  websites.create(req, res, next);
};

// 获取网站列表
let fetchWebsites = function(req, res, next) {
  websites.list(req, res, next);
};

// 删除网站信息
let deleteWebsite = function(req, res, next) {
  websites.delete(req, res, next);
};

// 修改网站信息
let updateWebsite = function(req, res, next) {
  websites.update(req, res, next);
};

module.exports = {
    'POST /pic/manage/v1/createWebsite' :createWebsite,
    'POST /pic/manage/v1/fetchWebsites' :fetchWebsites,
    'DELETE /pic/manage/v1/deleteWebsite' :deleteWebsite,
    'POST /pic/manage/v1/updateWebsite' :updateWebsite,
};
