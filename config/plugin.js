/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
};
module.exports.nunjucks = {
  enable: true,
  package: 'egg-view-nunjucks',
};
module.exports.mysql = {
  enable: true,
  package: 'egg-mysql'
};

module.exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};