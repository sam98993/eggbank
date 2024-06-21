'use strict';
module.exports = app => {
    const { STRING, INTEGER } = app.Sequelize;
  
    const Users = app.model.define('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: STRING(255), unique: true },
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