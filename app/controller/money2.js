const Controller = require('egg').Controller;

class Money2Controller extends Controller {
    async list() {
      const { ctx } = this;
      // const result = await this.app.mysql.get('users', { id: ctx.params.uid })
      const result = await this.app.model.Users.findByPk(ctx.params.uid)
      const dataList = {
        list: { id: result.id, money: result.money },
      };
      await this.ctx.render('money/money2.tpl', dataList);
    }
  }

module.exports = Money2Controller;