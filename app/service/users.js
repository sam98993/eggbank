const Service = require('egg').Service;

class UsersService extends Service {
  async show() {
    const users = await this.app.model.Users.findAll()
    return users;
  }

  async find(uid) {
    const user = await this.app.model.Users.findByPk(uid)
    return user;
  }

  async update({ money, summary }, uid) {
    await this.app.model.Users.update({ money, summary }, {where: {id: uid}});
  }
}

module.exports = UsersService;