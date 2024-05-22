'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING, TEXT } = Sequelize;
    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: STRING(255),
      password: STRING(255),
      name: STRING(255),
      created_at: DATE,
      updated_at: DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};