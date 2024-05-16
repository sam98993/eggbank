const Controller = require('egg').Controller;

class MoneyController extends Controller {
    async list() {
      const { ctx } = this;
      var message = ""
      const result = await this.app.model.Users.findByPk(ctx.request.body.uid)
      if (result.summary !== "") {
        message = result.summary
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