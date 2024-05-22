'use strict';
module.exports = app => {
    const { STRING, INTEGER, DATE } = app.Sequelize;
  
    const Summaries = app.model.define('summaries', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      content: STRING(255),
      created: DATE,
      user_id: INTEGER
    }, {
        timestamps: false
    });
    Summaries.associate = function () {
      app.model.Summaries.belongsTo(app.model.Users)
    };
    return Summaries;
  };