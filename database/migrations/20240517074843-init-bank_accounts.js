'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE } = Sequelize;
    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      money: { type: INTEGER },
      user_id: INTEGER,
      created_at: DATE,
      updated_at: DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};