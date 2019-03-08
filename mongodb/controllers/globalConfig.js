/**
 * Created by xiaoxu.song on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const config = mongoose.model('config');

const { resData } = require('../../util/common');

config.count({}, function(err, count) {
  if (err) {
    console.log('报错了');
  }
  // console.log('count=', count);
  if (count === 0) {
    // console.log('o yes');
    let task = new config({});
    task.save(function (err) {});
  }
});

exports.update = (req, res, next) => {
  let name = req.body.trainRatio;

  config.find({}, function(error, data) {
    data[0].trainRatio = name;
    data[0].save(function (err) {
      if (err) {
        // console.log('222');
        res.send(resData(-1, 'err!'));
        return;
      }
      return res.send(resData(0, 'success!'));
    });
  });
};

exports.fetchTrainRatio = (req, res, next) => {
  config.find({}, function(err, data) {
    if (data) {
      res.send(resData(0, 'success!', data[0]));
      return;
    } else {
      return res.send(resData(-1, 'error!'));
    }
    
  });
};

exports.trainRatio = async () => {
  // console.log('train');
  // await config.find({}, function(err, data) {
  //   if (data) {
  //     console.log('data[0].trainRati', data[0].trainRatio);
  //     return data[0].trainRatio;
  //   } else {
  //     return null;
  //   }
  // });
  let ss = await config.find({}).exec();
  console.log('wowosdfs=', ss);

  return ss[0].trainRatio;
};