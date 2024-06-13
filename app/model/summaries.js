'use strict';
module.exports = app => {
    const { INTEGER, DATE } = app.Sequelize;
  
    const Summaries = app.model.define('summaries', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      created: DATE,
      mode: INTEGER,
      changes: INTEGER,
      balance: INTEGER,
      user_id: INTEGER
    }, {
        timestamps: false
    });
    Summaries.associate = function () {
      app.model.Summaries.belongsTo(app.model.Users)
    };
    return Summaries;
  };