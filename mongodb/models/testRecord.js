/**
 * author qiujiapei 2018/07/20 
 */
'use strict';
 const mongoose = require('mongoose');
 const Schema = mongoose.Schema;

 const testRecordModel = new Schema({
    'id_request':Date,
    'id_batch':String,
    'name_subject':String,
    'id_subject':Schema.Types.ObjectId,
    'testAccount':Number,
    'rTop1':Number,
    'fTop1':Number,
    'accuracyTop1':String,
    'creditTop1':String,
    'rTop5':Number,
    'fTop5':Number,
    'accuracyTop5':String,
    'creditTop5':String,
    'accuracyBaidu':String,
    'comparedBaidu':String
 },{
  timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
  }
});


mongoose.model('testRecordModel',testRecordModel);