'use strict';

module.exports = app => {
    const { STRING, INTEGER, DATE } = app.Sequelize;
  
    const Users = app.model.define('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: STRING(255),
      password: STRING(255),
      name: STRING(255),
      money: INTEGER,
    }, {
        timestamps: false
    });
  
    return Users;
  };