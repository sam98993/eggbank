'use strict';
module.exports = app => {
    const { STRING, INTEGER, TEXT } = app.Sequelize;
  
    const Users = app.model.define('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: STRING(255),
      password: STRING(255),
      name: STRING(255)
    }, {
        timestamps: false
    });
    Users.associate = function () {
      app.model.Users.hasOne(app.model.BankAccounts)
      app.model.Users.hasMany(app.model.Summaries)
    };
    return Users;
  };