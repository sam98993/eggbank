const egg = require('egg');

// 修改为你的 Egg.js 应用的启动文件位置
egg.startCluster({
  baseDir: __dirname,
  workers: 4, // 根据服务器的 CPU 核心数进行配置
});