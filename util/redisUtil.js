'use strict';
var ioRedis = require('ioredis');
var redisConfig = (require('../configs/dbConfig')).redisConfig;

var client = null;

if (redisConfig.cluster) {
    client = new ioRedis.Cluster(redisConfig.connect_info);
} else {
    client = new ioRedis(redisConfig.connect_info[0]);
}

module.exports.Redis = client;

// 根据KEY删除collection 数据
module.exports.hdel = function (key, collectionName, cb) {
    let $cb = cb || function (err) {
            console.log('清除redis缓存', (err ? '失败' : '成功'), '，collectionName -> ', collectionName, 'key -> ', key, 'err -> ', err);
        };
    client.hdel(collectionName, key, $cb);
};

// 删除collection
module.exports.del = function (key, cb) {
    let $cb = cb || function (err) {
            console.log('清除redis缓存', (err ? '失败' : '成功'), '，collectionName -> ', key, 'err -> ', err);
        };
    client.del(key, $cb);
};
