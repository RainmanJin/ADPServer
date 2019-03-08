/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    name : String,
    sex : Number,
    age : Number,
    birth : Date,
    addr : String,
    createdAt  : { type : Date, default : Date.now }
});

testSchema.pre('save',function(next){
    next();
});

testSchema.methods = {
    updateAndSave : function () {
        return this.save();
    }
};

testSchema.statics = {
    fetch : function(){

    },
    findById : function(){

    },
    load : function(id){
        return this.findOne({_id : id })
            .exec();
    },
    list : function(options){
        const criteria = options.criteria || {age:13};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return this.find(criteria)
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
};
//注册mongoose模型，其他地方可以直接 mongoose.model('Test)调用
mongoose.model('Test',testSchema);
