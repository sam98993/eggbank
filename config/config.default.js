/* eslint valid-jsdoc: "off" */

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
    host: 'localhost',
    port: 3306,
    database: 'test',
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
