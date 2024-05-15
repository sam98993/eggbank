const Controller = require('egg').Controller;

class MoneyController extends Controller {
    async list() {
      const fs = require('node:fs')
      const { ctx } = this;
      var message = ""
      // const result = await this.app.mysql.get('users', { id: ctx.request.body.uid })
      const result = await this.app.model.Users.findByPk(ctx.request.body.uid)
      const file = result.name+'.txt'
      if (fs.existsSync(file)) {
        message = fs.readFileSync(file, 'Utf-8')
      } else {
        message = "尚無交易紀錄"
      }
      const dataList = {
        list: [
          { id: 1, title: '提款', url: 'money1', uid: result.id, money: result.money, msg: message },
          { id: 2, title: '存款', url: 'money2', uid: result.id },
        ],
      };
      await this.ctx.render('money/money.tpl', dataList);
    }
  }

module.exports = MoneyController;