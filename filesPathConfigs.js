'use strict';
const path = require('path');
let filesPathConfigs = {};
//项目根路径
filesPathConfigs.projectPath = path.resolve(__dirname,'./');

//控制器中间件路径
filesPathConfigs.controllerMiddlewarePath       = filesPathConfigs.projectPath + '/middlewares/controllerMiddleware.js';
//http记录器中间件路径
filesPathConfigs.httpRecorderMiddlewarePath       = filesPathConfigs.projectPath + '/middlewares/httpRecorder.js';
// filesPathConfigs.sessionMiddlewarePath          = filesPathConfigs.projectPath + '/middlewares/session_middle.js';
// filesPathConfigs.staticMiddlewarePath           = filesPathConfigs.projectPath + '/middlewares/static_middleware.js';
// filesPathConfigs.htmlTemplateMiddlewarePath     = filesPathConfigs.projectPath + '/middlewares/html_template_middleware.js';
// filesPathConfigs.logMiddlewarePath              = filesPathConfigs.projectPath + '/middlewares/log_middleware.js';

//controller路径:api父目录
filesPathConfigs.controllersFatherPath          = filesPathConfigs.projectPath + '/routes';

//static路径:静态资源父目录
filesPathConfigs.staticsPath                    = filesPathConfigs.projectPath + '/public';

//htmlTemplete路径:html模板目录
filesPathConfigs.viewsPath                      = filesPathConfigs.projectPath + '/views';

//数据库配置文件路径
filesPathConfigs.dbServiceConfigPath         = filesPathConfigs.projectPath + '/configs/dbConfig.json';

//mongodb的模型路径
filesPathConfigs.mongodbModelsConfigPath = filesPathConfigs.projectPath + '/mongodb/models';
//log4js日志系统配置路径
filesPathConfigs.log4jsConfigPath           = filesPathConfigs.projectPath + '/configs/log4jsConfig.json';

//第三方服务配置：爬虫服务、算法服务
filesPathConfigs.thirdServerConfigPath = filesPathConfigs.projectPath + '/configs/thirdInterfaceConfig.json';

//系统配置
filesPathConfigs.systemServerConfigPath = filesPathConfigs.projectPath + '/configs/systemConfig.json';

//暴露的文件目录
filesPathConfigs.logsPath = filesPathConfigs.projectPath + '/logs';

//工具目录
filesPathConfigs.utilsForMysql = filesPathConfigs.projectPath + '/util/dblUtil.js';
filesPathConfigs.utilsForMongodb = filesPathConfigs.projectPath + '/util/mongoUtil.js';
filesPathConfigs.utilsForLogger = filesPathConfigs.projectPath + '/util/logger.js';
filesPathConfigs.utilsForRedis = filesPathConfigs.projectPath + '/util/redisUtil.js';
filesPathConfigs.utilsForLogger = filesPathConfigs.projectPath + '/util/logger.js';

//后台环境变量统一设置
let algorithmConfig = require(filesPathConfigs.systemServerConfigPath);
filesPathConfigs.algorithmRequestIpPort = (function(ENV){
    let ipPort = '';
    for (const key in algorithmConfig.backendConfig) {
        if (key===ENV) {
            ipPort = algorithmConfig.backendConfig[key];
        }
    }
    return ipPort;
})(process.env.NODE_ENV);
module.exports = filesPathConfigs;