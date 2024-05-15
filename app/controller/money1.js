const Controller = require('egg').Controller;

class Money1Controller extends Controller {
    async list() {
      const { ctx } = this;
      // const result = await this.app.mysql.get('users', { id: ctx.params.uid })
      const result = await this.app.model.Users.findByPk(ctx.params.uid)
      if (result.money<=0) {
        const message = "餘額不足"
        const dataList = {
          list: { id: result.id, money: result.money, msg: message },
        };
        await this.ctx.render('money/money3.tpl', dataList);
      } else {
        const dataList = {
          list: { id: result.id, money: result.money },
        };
        await this.ctx.render('money/money1.tpl', dataList);
      }
    }
  }

module.exports = Money1Controller;