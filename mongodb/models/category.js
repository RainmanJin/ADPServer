/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const categorySchema = new Schema({
    name: String,//名称
    level:  { type: Number, index: true },//等级
    parent_id: { type: String, index: true },//父级ID
    parent_name:String,//父级名称
    children:Array,//子集
    created_time:String,//创建时间
    updated_time:String,//更新时间
    serial_number:String,//编号
    label:String,//前端树形结构所需要，等同于name
    value:String//前端树形结构所需要，等同于id
}, {
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
});
categorySchema.pre('save', function (next) {
    next();
});

categorySchema.methods = {
    updateAndSave: function () {
        return this.save();
    }
};

categorySchema.statics = {
    //查询分类全部信息
    list: async function () {
        let level1Array = await this.find({level: 1}).sort({updated:-1}).exec();
        try {
            for (let i = 0; i < level1Array.length; i++) {
                level1Array[i].created_time = moment(level1Array[i].created).format('YYYY-MM-DD HH:mm:ss');
                level1Array[i].updated_time = moment(level1Array[i].updated).format('YYYY-MM-DD HH:mm:ss');
                level1Array[i].label = level1Array[i].name;
                level1Array[i].value = level1Array[i]._id;
                level1Array[i].children = await this.find({parent_id: level1Array[i]._id}).sort({updated:-1}).exec();
                for (let j = 0; j < (level1Array[i].children).length; j++) {
                    level1Array[i].children[j].created_time = moment(level1Array[i].children[j].created).format('YYYY-MM-DD HH:mm:ss');
                    level1Array[i].children[j].updated_time = moment(level1Array[i].children[j].updated).format('YYYY-MM-DD HH:mm:ss');
                    level1Array[i].children[j].label = level1Array[i].children[j].name;
                    level1Array[i].children[j].value = level1Array[i].children[j]._id;
                    level1Array[i].children[j].children = await this.find({parent_id: (level1Array[i].children)[j]._id}).sort({updated:-1}).exec();
                    for(let k = 0 ; k < (level1Array[i].children[j].children).length ; k++){
                        level1Array[i].children[j].children[k].created_time = moment(level1Array[i].children[j].children[k].created).format('YYYY-MM-DD HH:mm:ss');
                        level1Array[i].children[j].children[k].updated_time = moment(level1Array[i].children[j].children[k].updated).format('YYYY-MM-DD HH:mm:ss');
                        level1Array[i].children[j].children[k].label = level1Array[i].children[j].children[k].name;
                        level1Array[i].children[j].children[k].value = level1Array[i].children[j].children[k]._id;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
        return level1Array;
    },
    //删除树(废弃)
    removeTree:async function (conditions) {
        try {
            let childArray = await this.find({parent_id: conditions._id}).exec();
            for(let i = 0  ; i < childArray.length ; i++){
                await this.remove({parent_id: childArray[i]._id}).exec();//如果有第三级，删除第三极
                await this.remove({_id: childArray[i]._id}).exec();//删除第二极
            }
            await this.remove({_id: conditions._id}).exec();//删除第一级
        } catch (err) {
            console.log(err);
        }
    },
    //通过ID删除
    removeById: async function (conditions) {
        try {
            let childArray = await this.find({parent_id: conditions._id}).exec();
            if(childArray.length > 0){//是否有子集
                return false;
            }else {
                await this.remove({_id: conditions._id});//删除第一级
                return true;
            }
        } catch (err) {
            console.log(err);
        }
    },
    //检查是否重名
    duplicatedName:async function (name,parent_id,id) {
        let nameList =await  this.find({parent_id:parent_id});
        for(let i = 0 ; i < nameList.length ; i++){
            if(name == nameList[i].name){
                if(id ==  nameList[i]._id){
                    return false;
                }else {
                    return true;
                }
            }
        }
        return false;
    },
    //反查三级
    searchCategoryRoot:async function (id) {
        try{
            let currentCategory =await  this.findOne({_id:id});
            let  level2Category,level1Category;
            if(currentCategory.parent_id){
                level2Category =await  this.findOne({_id:currentCategory.parent_id});
                level1Category = {
                    name:level2Category.parent_name,
                    id:level2Category.parent_id
                };
            }
            return {
                level1:level1Category,
                level2:level2Category,
                level3:currentCategory
            };
        }catch (err){
            console.log(err);
        }


    }
};
//注册mongoose模型，其他地方可以直接 mongoose.model('Category')调用
mongoose.model('Category', categorySchema);
