'use strict';
let fs = require('fs'),
    systemConfig = require('./configs/systemConfig'),
    FILES_PATH = require('./filesPathConfigs'),
// 导入controller (处理业务逻辑的 )      middleware(中间件):
    controllerMiddleware = require(FILES_PATH.controllerMiddlewarePath),
    httpRecorderMiddleware = require(FILES_PATH.httpRecorderMiddlewarePath),
    express = require('express'),
    serveIndex = require('serve-index'),
    app = express(),
    NODE_ENV = trim(app.get('env')),
    path = require('path'),
    // favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    // mysql = require('mysql'),
    mongodbConfigs = {};
let multer  = require('multer');
// const {tokenVerification} = require('./mongodb/controllers/usersToken');
const {
    resData
  } = require('./util/common');
const jwt = require('jsonwebtoken');
const moment = require('moment');
app.use(multer({ dest: '/tmp/'}).array('image'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(bodyParser.json());
// 是否允许配置使用querystring(false)或qs(true)来解析数据
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));


app.use(cookieParser());
app.use(express.static(FILES_PATH.staticsPath));
//去除首尾空格函数
function trim(str){ //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, '');
}
    /* 【注】屏蔽mysql，本项目不用
    mysqlConfigs = null,
    mysqlConnection = require('express-myconnection');
    */
//数据库配置

// 连接本地数据库
if(NODE_ENV === 'local'){
    console.log('获取mongodb配置文件mongodbLocalConfig');
    //【注】屏蔽mysql，本项目不用
    //mysqlConfigs = (require(FILES_PATH.dbServiceConfigPath)).mysqlDevConfig;
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbLocalConfig;

    //日志级别(从高到低的级别):OFF、FATAL、ERROR、WARN、INFO、DEBUG、ALL
    //Log4j建议只使用四个级别，优先级从高到低分别是 ERROR、WARN、INFO、DEBUG
    //用法：
    // let log = require('./util/logger').getLogger("system");
    // log.error("输出错误日志");
    app.use(httpRecorderMiddleware());//http记录
    let log = require('./util/logger').getLogger('system');
    log.info('启动应用:---------------------------------');
}
// 本地调试连接 - 开发环境数据库
else if (NODE_ENV === 'devdb') {

    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbDevDBConfig;
    app.use(httpRecorderMiddleware());//http记录

}
// 开发环境 - 连接开发数据库
else if (NODE_ENV === 'development'){
    console.log('获取mongodb配置文件mongodbDevConfig');
    //【注】屏蔽mysql，本项目不用
    //mysqlConfigs = (require(FILES_PATH.dbServiceConfigPath)).mysqlDevConfig;
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbDevConfig;
    app.use(httpRecorderMiddleware());//http记录
} else if(NODE_ENV === 'test'){
    console.log('获取mongodb配置文件mongodbTestConfig');
    //【注】屏蔽mysql，本项目不用
    // mysqlConfigs = (require(FILES_PATH.dbServiceConfigPath)).mysqlTestConfig;
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbTestConfig;
} else if(NODE_ENV === 'production'){
    console.log('获取mongodb配置文件mongodbProConfig');
    //【注】屏蔽mysql，本项目不用
    // mysqlConfigs = (require(FILES_PATH.dbServiceConfigPath)).mysqlProConfig;
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbProConfig;
} else {
    console.log('获取mongodb配置文件mongodbDevConfig');
    console.log('无效NODE_ENV');
    //【注】屏蔽mysql，本项目不用
    //mysqlConfigs = (require(FILES_PATH.dbServiceConfigPath)).mysqlDevConfig;
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbDevConfig;
    app.use(httpRecorderMiddleware());//http记录
    let log = require('./util/logger').getLogger('system');
    log.info('启动应用:-------------------------------------------------------');
}
console.log('当前运行环境：'+NODE_ENV);
////redis数据库
// let session = require('express-session'),
//    RedisStore = require('connect-redis')(session),
//    redisClient = require('./util/redisUtil');
//mongodb数据库
let mongoose = require('mongoose'),
//数据模型文件路径
    modelsPath = FILES_PATH.mongodbModelsConfigPath;
//连接mongoose
mongoose.connect(mongodbConfigs.uri, mongodbConfigs.options);
let mongooseConnect = mongoose.connection;
mongooseConnect.on('error', console.error.bind(console, 'mongodb连接失败!'));
mongooseConnect.on('open', console.info.bind(console, 'mongodb连接成功!'));
//注册mongoose模型
fs.readdirSync(modelsPath)
    .filter(file => ~file.search(/^[^.].*\.js$/))
    .forEach(file => {
        require(path.join(modelsPath, file));
    });

const {tokenVerification} = require('./mongodb/controllers/usersToken');
// session超时时间，单位：小时
// let timeoutHour = systemConfig.session_time_out_hour || 1;
// app.use(session({
//     secret: 'express',
//     store: new RedisStore({
//         client: redisClient.Redis,
//         prefix: 'admin_session_',
//         ttl: timeoutHour * 24 // 过期时间（默认是一天）
//     }),
//     resave: true,
//     saveUninitialized: true
// }));

//解决跨域：allow custom header and CORS
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        /*让options请求快速返回*/
    }
    else {
        next();
    }
});

// view engine setup
app.set('views', FILES_PATH.viewsPath);
app.set('view engine', 'ejs');  


//【注】屏蔽mysql，本项目不用
// 数据库连接:将方法绑定到req上;
// app.use(mysqlConnection(mysql, mysqlConfigs, 'pool'));

//routers
app.use('/',function (req, res, next) {
    next();
    /*
    if(req.path !== '/pic/manage/v1/login'){
        let token = req.headers.authorization;
        if(token === undefined || token === ''){
            return res.send(resData(-11,'缺少参数token'));
        }
        console.log(token);
        jwt.verify(token,'superSecret',function(error,decoded){
            console.log(error);
            if(error){
               return res.send(resData(-11,'token已过期'));
            //   return  res.redirect('http://localhost:8080/#/login');
            }else{
                console.log(decoded);   
                next();
            }           
        });
        
    }else{
        next();
    }
     */
});

app.use(controllerMiddleware(FILES_PATH.controllersFatherPath));//APIs



/**【注】：必须在所有中间件之后，否则serve-index中间件会阻塞其他中间件的执行
 * 静态资源托管目录权限配置
 *    服务启动后可访问一下目录
 *      1.public文件夹目录
 *      2.api文档目录
 *      3.logs日志目录
 *      全部托管：app.use(express.static(FILES_PATH.projectPath));
 */
app.use('/', serveIndex(__dirname, {'icons': true}));               //开启文件目录访问权限
app.use('/logs',express.static('logs'));                            //开启logs文件内容访问权限           
app.use('/apisDoc',express.static('apisDoc'));                 //开启apis文档访问权限

// app.use('/public',express.static('public'));    



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
    next();
});

module.exports = app;
