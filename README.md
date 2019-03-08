# node-demo

#### 项目介绍
node后台系统demo,集成了mysql、mongodb、redis数据库，所以需要在安装本项目的时候安装好三个数据库

#### 命令介绍
npm run doc   生成接口文档
npm run dev   本地开发（文件修改保存后进程自动重启）
npm run test  测试环境
npm run pro   生产环境

#### 列出静态文件资源目录
npm install serve-index --save 安装serve-index开发依赖

#### apidoc接口文档生成 命令
npm install apidoc -g      全局安装apidoc文档
npm install apidoc --save  安装apidoc开发依赖

#### eslint代码规范检查 命令
npm install eslint -g      全局安装命令
npm install eslint --save  安装开发依赖

#### pm2进程守护 命令
npm install pm2 -g        全局安装命令
npm install pm2 --save    安装开发依赖
npm run test              启动测试环境
npm run pro               启动生产环境
pm2 list                  当前pm2托管的进程列表
pm2 stop [app-name|id]    停止某一个进程，可以使用app-name或者id
pm2 stop all              停止所有进程
pm2 delete [app-name|id]  删除并停止进程
pm2 delete all            删除并停止所有进程
pm2 logs                  查看日志
pm2 logs [app-name]       查看指定进程的日志


#### 项目优化点
1.数据库连接失败的容错处理（建议：已知尝试连接，知道连接成功）

#### 其他说明
1.下载项目:git clone https://gitee.com/closer/node-demo.git

2. npm install

3.npm run start

4.如果项目启动成功，会有如下信息：

[2018-05-22T15:38:44.059] [INFO] system - 启动应用:-------------------------------------------------------

路由中间件处理的路由集合:

GET /page/home

GET /page/index

POST /api/users/register

GET /api/userList

GET /api/user

POST /api/addUser

当前NODE_ENV值:development

http://127.0.0.1:3000

[2018-05-22T15:38:44.121] [INFO] system - 当前占用端口:port 3000


