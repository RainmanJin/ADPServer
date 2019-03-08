# 后端与web交互接口设计

# 修改记录
<table>
    <tr>
        <th>项目版本</th>
        <th>修改内容</th>
        <th>修改人</th>
        <th>修改日期</th>
    </tr>
    <tr>
        <td>egezi</td>
        <td>和web管理后台的交互接口</td>
        <td>黄启银</td>
        <td>2017年4月19日</td>
    </tr>
</table>

---

> 注意事项
1. 接口必须支持HTTP get/post 形式的请求，返回信息均已json格式返回。返回的json 
`{“code”: 0, “data”:{}, “message”: “xxxx”}` mssage为code不是0的时候，错误提示信息。data的数据为接口返回的内容信息
2. 请求参数均以UTF-8编码传参，响应信息也以UTF-8编码返回
3. host egezi.com/
4. 下面接口中http method 为get的查询参数，虽然文档通过```{"a": "b"}```表现的，但是通过传递给后端的url中必须使用标准的 ?a=b&.... 这种形式传递给后端
5. 下面接口中http method 为post的body内容 body放的内容必须是 json dumps生成的内容。
6. 下面的host是 119.23.35.59:80 端口是80端口 (测试环境是这个)

# 错误码列表
- 0 表示正确
- 4000 没有此用户
- 4001 密码错误
- 4002 表示参数错误
- 4003 表示没有登录
- 4006 表示没有权限登陆

# 1.用户登陆接口
### 1.1 登陆接口
 - 接口地址： http://host/auto/login/
 - http.method GET
 - 查询参数 

 ```python
 {
    "phone": 'xx",
    "password": "xxx" # 密码的md5
    "mobile": 1 # 表示来自移动端，0 表示来自web 
 }
 ```
 - 返回结果
 
```python
 {
     "code": 0,  # code 为 4006 表示没有权限登陆
     "data": {
        "work_role": 1 # 角色  32 系统管理员，16 加盟管理员 14 平台管理员 12 平台运营人员 10 维护(安装) 8 第三方管理人员 6 第三方运营人员    
        "state": 0 # 密码或者是账号不存在 1 表示登陆成功
     }
     "message": "" # 错误信息
 }
 # http 会写入cookie , 下面所有的请求都会检验是否有这个cookie，如果没有，返回错误码
 {
     "is_login": 1 # 表示已经登录 
     "job_member": "xxx" # 工号
     "phone": 'xx",
     "name": "xxx" # 员工姓名
     "merchant_number"： "xxx" # 商家编号  对于系统管理员，平台管理，平台运营登陆，商家账号为空
     "work_role": 8
 }
```

### 1.2 查询人员列表
 - 接口地址： http://host/auto/user_list/
 - http.method GET
 - 查询参数 

 ```python
 {
    "merchant_account": "xxx" # 商家账号
    "work_role": "10,12,23" #  多个角色以,分割
    "page": 0, # 查询制定页的数据
    "per_page_count": 20 # 每页限定的数据
    #查询参数为空，表示查询所有人
 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
            "page": 0,
            "page_count": 1 # 总的页数
            "user_list": [{
                "job_member": "xxx" # 工号
                "name": "xxx" # 姓名
                "work_role": 1 # 角色  32 系统管理员，16 加盟管理员 14 平台管理员 12 平台运营人员 10 维护(安装) 8 第三方管理人员 6 第三方运营人员    
                "region": "xxx" # 区域信息
                "phone":"xxx" # 电话
                "qq": "xxx"
                "work_content": "xxx"
                "register_date": 100 # 注册日期
                "device_number": 10 # 设备数量
                "status": 1 # 1 正常， 2 注销 
                "merchant_number": "xxx" # 商家编号
            }]
    },
    "message": "xxx"
}
```

### 1.3 添加用户
 - 接口地址： http://host/auto/add_user/
 - http.method POST

 ```python
 {
    "name": "xxx" # 姓名
    "work_role": 1 # 角色  32 系统管理员(不允许添加)，16 加盟管理员 14 平台管理员 12 平台运营人员 10 维护(安装) 8 第三方管理人员 6 第三方运营人员    
    "region": "xxx" # 区域信息
    "phone":"xxx" # 电话
    "qq": "xxx"
    "work_content": "xxx"
    "merchant_account": "xxx"  # 对于添加加盟管理员，第三方管理人员，第三方运营人员 必须提供商家账号 对于平台人员添加，该字段不需要提供，否则会报错
 }
```
 - 返回结果

```python
{
    "code": 0,
    "data": [ 
        "state": 0 # 0 表示成功 1 表示该手机号已经存在了，手机号码不能够重复存在多个角色之间
        "job_member": "xxx" # 工号
    ],
    "message": "xxx"
}
```
### 1.4 修改用户以及激活/注销用户
 - 接口地址： http://host/auto/user_info/
 - http.method GEt
 - 查询参数 无
er

 ```python
 {
    "job_member": "xxx" # 工号
    "name": "xxx" # 姓名
    "work_role": 1 # 角色  32 系统管理员，16 加盟管理员 14 平台管理员 12 平台运营人员 10 维护(安装) 8 第三方管理人员 6 第三方运营人员    
    "region": "xxx" # 区域信息
    "phone":"xxx" # 电话
    "qq": "xxx"
    "work_content": "xxx"
    "register_date": 100 # 注册日期
    "device_number": 10 # 设备数量
    "status": 1 # 1 正常， 2 注销 
    "merchant_number": "xxx" # 商家编号
 }
 ```

### 1.5 修改用户以及激活/注销用户
 - 接口地址： http://host/auto/user_info/
 - http.method POST

 ```python
 {
    "job_member": "xxx" # 工号
    "name": "xxx" # 姓名
    "phone":"xxx" # 电话
    "qq": "xxx"
    "work_content": "xxx"
    "status": 1 # 1 正常， 2 注销 
 }
 ```

 - 返回结果

```python
{
    "code": 0,
    "data": [ 
        "state": 0 # 0 表示成功，1表示此工号不存在
    ],
    "message": "xxx"
}
```

### 1.6 重置用户密码
 - 接口地址： http://host/auto/reset_password/
 - http.method POST

 ```python
 {
    "job_member": "xxx" # 工号
 }

```

 - 返回结果

```python
{
    "code": 0,
    "data": [ 
        "state": 0 # 0 表示成功，1表示此工号不存在
    ]
    "message": "xxx"
}
```

### 1.7 查询人员
 - 接口地址： http://host/auto/user_info/
 - http.method GET
 - 查询参数 

 ```python
 {
     "job_member": "xxx" # 工号
 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
            "job_member": "xxx" # 工号
            "name": "xxx" # 姓名
            "work_role": 1 # 角色  32 系统管理员(不允许添加)，16 加盟管理员 14 平台管理员 12 平台运营人员 10 维护(安装) 8 第三方管理人员 6 第三方运营人员    
            "region": "xxx" # 区域信息
            "phone":"xxx" # 电话
            "qq": "xxx"
            "work_content": "xxx"
            "register_date": 100 # 注册日期
            "device_number": 10 # 设备数量
            "status": 1 # 1 正常， 2 注销 
            "merchant_number": "xxx" # 商家编号
    },
    "message": "xxx"
}
```

# 2 商品条码
### 2.1 商品条码查询列表

 - 接口地址： http://host/auto/bar_code_list/
 - http.method GET
 - 查询参数 

 ```python
 {
    "page": 0, # 查询制定页的数据
    "per_page_count": 20 # 每页限定的数据
    "mobile": 1 # 表示来自移动端，0 表示来自web 
    "resale": 1 # 表示零售商品，0表示非零售商品
    "status": 0 # 0表示注销 1表示正常 2 表示所有
 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
        "page": 0 # 当前页 0 表示第一页
        "page_count": #  总的页数
        "bar_code_list": [
            {
                "bar_code": "xxx" # 商品条码 690 到 699 是中国零售条形码 非零售商品不是以690 到 699 作为编码就可以
                "name": "xxx" # 商名称
                "resale": 1 # 表示零售商品，0表示非零售商品
                "type": "xxx" # 商品类别 素菜 饮料
                "cost_price": 10 # 商品成本价格 单位分
                "sale_price": 10 # 商品售卖价格 单位分
                "create_time": 0 # 创建时间
                "status": 1 # 1 表示，0表示注销
                "modify_time": 0 # 修改时间
                "register": "xxx" # 注册人员
                "expire_time": 10 # 商品有效期 -1 表示
                "image_url": "xx" # 图片url
            }
        ]
    }
}

```

### 2.3 商品条码新增

 - 接口地址： http://host/auto/add_bar_code/
 - http.method POST
 - post post内容

 ```python
 {
    "bar_code": "xxx" # 商品条码 690 到 699 是中国零售条形码 非零售商品不是以690 到 699 作为编码就可以
    "name": "xxx" # 商名称
    "resale": 1 # 表示零售商品，0表示非零售商品
    "type": "xxx" # 商品类别 素菜 饮料
    "cost_price": 10 # 商品成本价格 单位分
    "sale_price": 10 # 商品售卖价格 单位分
    "register": "xxx" # 注册人员
    "expire_time": 10 # 商品有效期 -1 表示 无限制
    "image_id": "xxx" # 图片id
 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
        "state": 0 # 0 表示成功，1表示重复添加，2表示图片id 不存在
    }
    "message": "xxx"
}

```


### 2.4 商品条码修改

 - 接口地址： http://host/auto/modify_bar_code/
 - http.method POST
 - post post内容

 ```python
 {
    "bar_code": "xxx" # 商品条码 690 到 699 是中国零售条形码 非零售商品不是以690 到 699 作为编码就可以
    "name": "xxx" # 商名称
    "type": "xxx" # 商品类别 素菜 饮料
    "cost_price": 10 # 商品成本价格 单位分
    "sale_price": 10 # 商品售卖价格 单位分
    "image_id": "xxx" # 先通过上传图片，生成image_id 在通过此协议上传
 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
        "state": 0 # 0 表示成功，1 表示该条码不存在 2表示条码 不存在
    }
    "message": "xxx"
}
```


### 2.4 商品条码注销

 - 接口地址： http://host/auto/cancel_bar_code/
 - http.method POST
 - post post内容

 ```python
 {
    "bar_code": "xxx" # 商品条码 690 到 699 是中国零售条形码 非零售商品不是以690 到 699 作为编码就可以
 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
        "state": 0 # 0 表示成功，1表示条码 不存在
    }
    "message": "xxx"
}
```

### 2.5 商品类型名称列表

 - 接口地址： http://host/auto/good_types/
 - http.method GET
 - 返回结果

```python
{
    "code": 0,
    "data": {
        "1": "蔬菜",
        "2": "饮料",
        "3": "水果"
    }
    "message": "xxx"
}
```


# 3 商家
### 3.1 增加商家信息
 - 接口地址： http://host/auto/add_merchant/
 - http.method POST
 - post post内容

 ```python
 {
      "region_code": "xxx",
      "merchant_name": "xxx", # 商家名称
      "merchant_type": 1, # 服务器类型 2 表示加盟商家, 1 表示平台商家
      "merchant_linker": "xx", # 商家联系人
      "merchant_linker_phone": "xx", # 商家联系人电话
      "card": "xxx", # 卡号
      "cardholder": "xxx", # 持卡人
      "bank_name": "xxx", # 银行名称
      "rate": "xxx", # 提成率 0.005 0.01 
      #"status": 0 # 1 表示正常，0 表示注销
 }
 ```

 - 返回结果

```python
{
    "code": 0,
    "data": {
        "state": 0 # 0 表示成功，1 商家联系人号码重复存在
        "merchant_number": "xxx" # 商家编号 (城市区域行政编码+唯一编码)
        "merchant_account": "xxx" # 商家账号
    }
    "message": "xxx"
}
```

### 3.2 获取商家信息列表
 - 接口地址： http://host/auto/merchant_list/
 - http.method GET

 ```python
 {
    "page": 0, # 查询制定页的数据
    "per_page_count": 20 # 每页限定的数据
 }
 ```

 - 返回结果

 ```python
 {
    "page": 0 # 当前页 0 表示第一页
    "page_count": #  总的页数
     "merchant_list": [
      {
            "merchant_number": "xx" # 商家编号
            "merchant_account": "xx" # 商家账号
            "region_code": "xxx"
            "merchant_name": "xxx" # 商家名称
            "merchant_type": 1 # 服务器类型 2 表示加盟商家, 1 表示平台商家
            "merchant_linker": "xx" # 商家联系人
            "merchant_linker_phone": "xx" # 商家联系人电话
            "card": "xxx" # 卡号
            "cardholder": "xxx" # 持卡人
            "bank_name": "xxx" # 银行名称
            "register_date": 14900000 # 注册日期 都是timestamp 
            "rate": "xxx" # 提成率 0.005 0.01 
            "status": 0 # 1 表示正常，0 表示注销
            "remain_money": 0 # 余额
            "device_number": 0 # 设备数量
        }
     ]
 }
 ```

### 3.3 修改商家信息(包括注销)
 - 接口地址： http://host/auto/modify_merchant/
 - http.method POST
 - post post内容

 ```python
 {
      "merchant_number": "xxx" # 商家编号 (城市区域行政编码+唯一编码)
      "merchant_linker": "xx", # 商家联系人
      "merchant_linker_phone": "xx", # 商家联系人电话
      "card": "xxx", # 卡号
      "cardholder": "xxx", # 持卡人
      "bank_name": "xxx", # 银行名称
      "status": 0 # 1 表示正常，0 表示注销
 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
        "state": 0 # 0 表示成功，1 商家编号不存在
    }
    "message": "xxx"
}
```

### 3.4 添加意向商家信息
 - 接口地址： http://host/auto/add_intent_merchant/
 - http.method POST
 - post post内容

 ```python
 {
      "merchant_name": "xxx" # 商家名称
      "merchant_linker": "xx" # 商家联系人
      "merchant_linker_phone": "xx" # 商家联系人电话
      "wechat_account": "xxx"
      "email": "xxx"
      "content": "xxx" # 意向内容
 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
               "state": 0 # 0 表示成功，1表示该手机号重复
                "_id": "xxx"
    }
    "message": "xxx"
}
```

### 3.5 获取商家信息列表
 - 接口地址： http://host/auto/intent_merchant_list/
 - http.method GET

 ```python
 {
    "page": 0, # 查询制定页的数据
    "per_page_count": 20 # 每页限定的数据
 }
 ```

 - 返回结果

 ```python
 {
    "page": 0 # 当前页 0 表示第一页
    "page_count": #  总的页数
    "register_date": 14900000 # 注册日期 都是timestamp 
    "merchant_list": [ {
            "_id": "xxx"
            "merchant_name": "xxx" # 商家名称
            "merchant_linker": "xx" # 商家联系人
            "merchant_linker_phone": "xx" # 商家联系人电话
            "wechat_account": "xxx"
            "email": "xxx"
            "content": "xxx" # 意向内容
            "status": 0 # 1 表示未处理 0 表示已经处理

        }
     ]
 }
 ```


### 3.6  处理意向商家的状态(包括修改意向商家信息)
 - 接口地址： http://host/auto/modify_intent_merchant/
 - http.method POST
 - post post内容

 ```python
 {
      "_id": "xxx"
      "merchant_name": "xxx" # 商家名称
      "merchant_linker": "xx" # 商家联系人
      "merchant_linker_phone": "xx" # 商家联系人电话
      "wechat_account": "xxx"
      "email": "xxx"
      "content": "xxx" # 意向内容
      "status": 0 # 1 表示未处理 0 表示已经处理

 }
 ```
 - 返回结果

```python
{
    "code": 0,
    "data": {
        "state": 0 # 0 表示成功，1表示_id不存在
    }
    "message": "xxx"
}
```


### 3.7  查询商家信息
 - 接口地址： http://host/auto/merchant_info_query/
 - http.method get
 - 查询内容
 
 ```js
 {
      "merchant_account": "xx"  # 
 }
 ```

 - 返回结果

 ```python
 {
      "merchant_number": "xxx" # 商家编号 (城市区域行政编码+唯一编码)
      "merchant_account": "xx" # 商家账号，可以理解为商家易读的编号
      "region_code": "xxx"
      "merchant_name": "xxx" # 商家名称
      "merchant_type": 1 # 商家类型  1 表示第三方商家, 2 表示加盟商家
      "merchant_linker": "xx" # 商家联系人
      "merchant_linker_phone": "xx" # 商家联系人电话
 }
 ```


# 4 自助柜子管理

### 4.1  申请自助柜子
 - 接口地址： http://host/auto/add_egezi/
 - http.method POST
 - post post内容

```python
{
    "merchant_account": "xxx" # 商家账号
    "belong": 1 # 设备附属平台还是第三方商家 1 表示 平台  3 表示 第三方商家
    "device_type": 1 # 1 表示小格子级别，4 表示中型级别 8 表示大型级别
    "good_boxes":　10 # 货柜数量
    "address_info": {
        "detail_address": "xxx" # 地址/安装地址
        "region_code": "510001" # 地域编码
    }
    "merchant_linker": "xxx" # 商家联系人
    "merchant_linker_phone": "xxx" # 商家联系人
    "device_id": "xxx" #  设备编号
    "maintainer": "xxx" # 维护人员
    "maintainer_phone": "xxx" # 维护人员电话
    "operation": "xxx" # 运营人员
    "operation_phone": "xxx" # 运营人员电话
    "pre_finish_time": 0 # 预完成时间
}
```
 - 返回结果

 ```python
 {
    "code": 0,
    "data": {
        "state": 0 # 0 表示成功，1表示失败, # 2 表示商家账号不存在
    }
    "message": "xxx"
 }
```


### 4.2 获取柜子编码

 - 接口地址： http://host/auto/egezi_id/
 - http.method GET

 ```python
 {
     "region_code": "xxx"
 }
 ```

 - 返回结果

 ```python
 {
    "code": 0,
    "data": {
        "device_id": "xxx" # 设备id
    }
    "message": "xxx"
 }
 ```

 ### 4.3 修改柜子信息
 - 接口地址： http://host/modify_egezi/
 - http.method POST
 - post post内容

```python
{
    "device_id": "xxx" # 设备id
    "device_type": 1 # 1 表示小格子级别，4 表示中型级别 8 表示大型级别
    "good_boxes":　10 # 货柜数量
    "address_info": {
        "detail_address": "xxx" # 地址/安装地址
        "region_code": "510001" # 地域编码
    }
    "merchant_linker": "xxx" # 商家联系人
    "merchant_linker_phone": "xxx" # 商家联系人
    "maintainer": "xxx" # 维护人员
    "maintainer_phone": "xxx" # 维护人员电话
    "operation": "xxx" # 运营人员
    "operation_phone": "xxx" # 运营人员电话
    "pre_finish_time": 0 # 预完成时间
}
```

 - 返回结果

 ```python
 {
    "code": 0,
    "data": {
        "state": 0 #  0 表示修改成功, 1 表示 device_id不存在
    }
    "message": "xxx"
 }
```


### 4.4 获取柜子列表(包括申请中的柜子列表)

 - 接口地址： http://host/auto/egezi_list/
 - http.method GET

 ```python
 {
     # 对于设备列表 需要传递以下字段
    "begin_time": 00  # 查询自助柜列表，必须包含此字段
    "end_time": 00 # 查询自助柜列表, 必须包含此字段
    "belong": 1 # 设备附属平台还是第三方商家 1 表示 平台  3 表示 第三方商家
    "merchant_account": "xxx" # 商家账号 不传递此参数表示所有
    "maintainer": "xxx" # 维护人员 不传递此参数表示所有
    "operation": "xxx" # 运营人员 不传递此参数表示所有

    # 对于设备申请列表 必须包含以下字段
    "apply_status": 1 # 申请状态 1 表示申请中  2 表示安装中 3 表示完成 4 表示所有 (查询设备申请列表，必须包含该字段)
    "begin_time": 00  # 查询自助柜列表，必须包含此字段
    "end_time": 00 # 查询自助柜列表, 必须包含此字段
    "merchant_account": "xxx" # 商家账号 不传递此参数表示所有

}
 ```

 - 返回结果

 ```python
 {
    "code": 0,
    "data": {
        "state": 0 # 0 表示查询成功， 2表示merchant_account 表示不存在 (查询参数提供了该字段，就会去校验)
        "total_device": 10 # 表示总的设备
        "breakdown_device": 0 # 此次查询故障设备
        "device_list": [
            "merchant_account": "xxx" # 商家账号
            "merchant_name": "xxx" # 商家账号
            "belong": 1 # 设备附属平台还是第三方商家 1 表示 平台  3 表示 第三方商家
            "device_type": 1 # 1 表示小格子级别，4 表示中型级别 8 表示大型级别
            "good_boxes":　10 # 货柜数量
            "address_info": {
                "detail_address": "xxx" # 地址/安装地址
                "region_code": "510001" # 地域编码
            }
            "price_per_year": 10 # 如果是租赁，价格是多少
            "merchant_linker": "xxx" # 商家联系人
            "merchant_linker_phone": "xxx" # 商家联系人
            "device_id": "xxx" #  设备编号
            "maintainer": "xxx" # 维护人员
            "maintainer_phone": "xxx" # 维护人员电话
            "operation": "xxx" # 运营人员
            "operation_phone": "xxx" # 运营人员电话
            "pre_finish_time": 0 # 预完成时间
            "running_status": 1 # 运行状态 1 表示正常，2 缺货，3 故障, 4 停止
            "empty_boxes": 10 # 空柜子数量
            "total_sale_money": 10 # 总销售
            "create_time": 0 # 录入新设备时间
            "apply_time": 0 # 申请时间
            "apply_status": 1 # 申请状态 1 表示申请中  2 表示安装中 3 表示完成
        ]
    }
    "message": "xxx"
 }
 ```

### 4.5 生成设备的二维码图片

 - 接口地址： http://host/auto/device_qrcode/
 - http.method GET

 ```python
 {
     "device_id": "xxx" # 设备id
}
 ```

 - 返回结果
 以device_id命名的图片文件


 # 5 订单

 - 接口地址： http://host/auto/order_list/
 - http.method GET

 ```python
{
    "_id": "xxx" # 订单id 只查询指定订单的内容 内容为空或者是不提供表示任意订单
    "merchant_account": "xxx"  # 内容为空或者是不提供该字段 表示所有 
    "begin_time": 0   # 有提供begin_time就 必须提供 end_time  该两个字段为0 或者是不提供 表示 任意时间范围的内容
    "end_time": 0
    "page": 0, # 查询制定页的数据  任意条件下，必须提供该字段
    "per_page_count": 20 # 每页限定的数据 任意条件下，必须提供该字段
}
 ```
 - 返回结果

 ```python
 {
     "code": 0,
     "data": {
        "page": 0 # 当前页 0 表示第一页
        "page_count": #  总的页数
         "order_list": [
             {
                "_id": "xx"  # 订单号 用的是数据库自动生存的订单
                "merchant_name": "xxx" # 商家名称
                "device_id": "xxx"
                "device_address": "xxx" # 设备地址
                "total_money": 1012 # 交易金额 单位分 表示 10.12元
                "exchange_time": 0 # 交易时间
                "status": 0 # 预生成，待支付， 1 表示已经支付，但是开箱失败的订单 2 表示已经支付开箱成功的订单 3 表示过期的订单  status 只返回等于2的数据
                "goods_list": [{
                        "box_number": "xxx" # 货柜编号
                        "bar_code": "xxx" # 商品条码 690 到 699 是中国零售条形码 非零售商品不是以690 到 699 作为编码就可以
                        "number": 0  # 商品数量
                        "name": "xxx" # 商品名称
                        "type": "xxx" # 商品类型
                        "add_time": 148000000 # 商品时间
                        "remove_time": "xxx" # 货物下架时间
                        "status": 0 # 0 表示箱子空的，1 表示货物上架中，2表示上架失败（故障），3表示有商品可售卖（在线） 4 表示 商品锁定支付中 5 用户支付后，自动开箱失败 6 商品已经售卖 7 货物下架中 8 货物下架失败 9 表示格子货物过期
                        "image_url": "xx" # 图片url
                        "price": 1000 #商品单价
                        "total_money": 1012 # 交易金额 单位分 表示 10.12元
                        "total_weight": 10 # 总的重量  # 如果是以数量为单位的商品，此字段可以忽略  单位是 g
                   }]
             }
         ]
     }
     "message": "xxx"
 }
```

# 6 资金明细 

 - 接口地址： http://host/auto/mcx_list
 - http.method GET

 ```python
{
    "merchant_account": "xxx"
    "money_type": 0 # 0 表示提成，1表示提现 
    "page": 0, # 查询制定页的数据
    "per_page_count": 20 # 每页限定的数据
}
 ```
 - 返回结果
 ```python
 {
     "code": 0,
     "data": {
        "page": 0 # 当前页 0 表示第一页
        "page_count": #  总的页数
         "order_list": [ {
                "_id": "xxx" #提现单号
                "exchange_time": 0 #  提现时间
                "merchant_account": "xxx" # 商家唯一编号
                "merchant_name": "xxx" # 商家名称
                "merchant_type": 1 # 服务器类型 2 表示加盟商家, 1 表示平台商家
                "exchange_content": "xx" # 
                "exchange_money": "xxx" # 交易金额
                "card": "xxx" # 卡号
                "cardholder": "xxx" # 持卡人
                "wechat_account": "xxx"
                "linker": "xxx"
                "linker_phone": "xxx"
                "status": 1 # 提现申请状态 1 表示申请中，2 表示处理
                "money_type": 0 # 0 表示提成，1表示提现
             }
         ]
     }
     "message": "xxx"
 }

```

# 7 图片上传协议

 - 接口地址： http://host/auto/images/

 - http.method POST

 ```python
    # 上产文件使用说明以及注意事项
    POST 多个分块编码的文件¶
    你可以在一个请求中发送多个文件。例如，假设你要上传多个图像文件到一个 HTML 表单，使用一个多文件 field 叫做 "images":

    <input type="file" name="images" multiple="true" required="true"/>
    要实现，只要把文件设到一个元组的列表中，其中元组结构为 (form_field_name, file_info):

    >>> multiple_files = [
            ('images', ('foo.png', open('foo.png', 'rb'), 'image/png')),
            ('images', ('bar.png', open('bar.png', 'rb'), 'image/png'))]
    >>> r = requests.post(url, files=multiple_files)
    >>> r.text
    {
    ...
    'files': {'images': 'data:image/png;base64,iVBORw ....'}
    'Content-Type': 'multipart/form-data; boundary=3131623adb2043caaeb5538cc7aa0b3a',
    ...
    }

    多个文件的fiele 必须是 images 单个文件也是如此
```

 - 返回结果

```python
{
    "code": 0,
    "data": {
        "image_id_list": ["xxx"] # 返回的是图片id
        "urls": [
            {
                "image_id": "xxx",
                "url": "xxx"
            }
    }
    "message": "xxx"
}

```


# 8 首页统计数据

 - 接口地址： http://host/auto/home-statistic
 - http.method: GET
 - 查询参数 无
 - 返回结果

 ```js
 {
     "code": 0
     "data": {
        "running_devices": 10 # 运行中的设备
        "total_devices": 20  # 总的设备
        "third_merchant": 10 # 第三方商家
        "joining_merchant": 10 # 加盟商家
        "current_month_profit": 10 # 当月平台盈利  # 由于第三方商家计算模式不清晰，不计入在内
        "year_sales": [  # 年度销售情况
            {
                "month": 1 #  1 到12月
                "total_money": 1000 # 总金额
            }
        ],
        "year_profits": [ # 年度盈利情况
                "month": 1 #  1 到12月
                "total_money": 1000 # 总金额
        ]
     }
     "message": "xxx"
 }
 ```