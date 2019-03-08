'use strict';
let globalConfig = require('../mongodb/controllers/globalConfig');

// 
let updateTrainRatio = function(req, res, next) {
  globalConfig.update(req, res, next);
};

let fetchTrainRatio = function(req, res, next) {
  globalConfig.fetchTrainRatio(req, res, next);
};

module.exports = {
    'POST /pic/manage/v1/updateTrainRatio' :updateTrainRatio,
    'GET /pic/manage/v1/fetchTrainRatio' :fetchTrainRatio,
};