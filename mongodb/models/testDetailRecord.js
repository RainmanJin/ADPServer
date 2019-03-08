/**
 * by jiaoei.qiu 2018/07/24
*/

'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const testDetailRecordModel = new Schema({
  'id_request':Date,
  'id_batch':String,
  'name_subject':String,
  'id_subject':Schema.Types.ObjectId,
  'deal_model':String,
  'rTop1':Number,
  'fTop1':Number,
  'accuracyTop1':String,
  'creditTop1':String,
  'rTop5':Number,
  'fTop5':Number,
  'accuracyTop5':String,
  'creditTop5':String
},{
  timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
  }
});

mongoose.model('testDetailRecordModel',testDetailRecordModel);