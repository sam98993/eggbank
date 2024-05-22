'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('summaries', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      content: STRING(255),
      created: DATE,
      user_id: INTEGER
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('summaries');
  }
};