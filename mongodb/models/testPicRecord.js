/**
 * by jiaoei.qiu 2018/07/24
*/

'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const testPicRecordModel = new Schema({
  'id_request':Date,
  'id_batch':String,
  'id_subject':Schema.Types.ObjectId,
  'id_pic':Number,
  'name_subject':String,
  'deal_model':String,
  'picName':String,
  'isTop1':Boolean,
  'isTop5':Boolean,
  'creditOfTop1':Number,
  'nameOfTop1':String,
  'creditOfTop2':Number,
  'nameOfTop2':String,
  'creditOfTop3':Number,
  'nameOfTop3':String,
  'creditOfTop4':Number,
  'nameOfTop4':String,
  'creditOfTop5':Number,
  'nameOfTop5':String,
  'isBaiduTop1':Boolean,
  'creditOfBaiduTop1':Number,
  'errType':String   
},{
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated'
}
});


mongoose.model('testPicRecordModel',testPicRecordModel);