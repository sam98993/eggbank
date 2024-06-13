/* eslint valid-jsdoc: "off" */

const bank_accounts = require("../app/model/bank_accounts");

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1715146227711_203';

  exports.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.tpl': 'nunjucks',
    },
  };

  exports.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '',
      database: 'test'
    },
    app: true,
    agent: false
  };

  exports.sequelize = {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'test',
    username: process.env.DB_USER || 'newuser',
    password: process.env.DB_PASSWORD || 'password',
  }

  exports.redis = {
    client: {
        host: 'localhost',
        port: '6379',
        password: '',
       db: 0
    }
  };

  exports.customLogger = {
    RBLogger: {
      file: 'redis_backup.log'
    }
  }

  exports.logrotator = {
    filesRotateBySize: [
      'redis_backup.log',
    ],
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 10,
    rotateDuration: 24 * 60 * 60 * 1000,
    maxDays: 7
  }

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
