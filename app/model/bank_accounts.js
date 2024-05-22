'use strict';
module.exports = app => {
    const { INTEGER, TEXT } = app.Sequelize;
  
    const BankAccounts = app.model.define('bank_accounts', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      money: INTEGER,
      summary: TEXT,
      user_id: INTEGER
    }, {
        timestamps: false
    });
    BankAccounts.associate = function () {
      app.model.BankAccounts.belongsTo(app.model.Users)
    };
    return BankAccounts;
  };