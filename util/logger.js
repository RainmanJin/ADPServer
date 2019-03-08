'use strict';
const log4js = require('log4js');
const log4jsConfig = require(require('../filesPathConfigs').log4jsConfigPath);
log4js.configure(log4jsConfig);//加入日志配置文件
exports.getLogger=function(category){
    return log4js.getLogger(category);//category是对应的级别，具体见配置文件
};
