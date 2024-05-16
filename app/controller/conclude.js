const Controller = require('egg').Controller;

class ConcludeController extends Controller {
    async list() {
      const Sequelize = require('sequelize');
      const { ctx } = this;
      var message = ""
      const haveDecimalPoint = ctx.request.body.num2 % 1
      const result = await this.app.model.Users.findByPk(ctx.request.body.uid)
      if (ctx.params.mode === "1") {
        if (ctx.request.body.num2 > result.money){
          message = "提款金額不可高過餘額"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else if( haveDecimalPoint !== 0 || parseInt(ctx.request.body.num2) === NaN){
          message = "輸入金額出現錯誤"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else if(ctx.request.body.num2 < 0){
          message = "提款金額不可為負數"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else {
          message = '提款金額為：' + ctx.request.body.num2 + '元，所剩餘額為：' + ctx.request.body.txtResult + '元'
          await this.app.model.Users.update({money: ctx.request.body.txtResult, summary: Sequelize.fn('CONCAT', Sequelize.col("summary"), message + '\n')}, {where: {id: ctx.request.body.uid}});
          const result = await this.app.model.Users.findByPk(ctx.request.body.uid)
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        }
      } else {
        if (haveDecimalPoint !== 0 || parseInt(ctx.request.body.num2) === NaN){
          message = "輸入金額出現錯誤"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else if (ctx.request.body.num2 < 0) {
          message = "存款金額不可為負數"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else {
          try {
            message = '存款金額為：' + ctx.request.body.num2 + '元，所剩餘額為：' + ctx.request.body.txtResult + '元'
            await this.app.model.Users.update({money: ctx.request.body.txtResult, summary: Sequelize.fn('CONCAT', Sequelize.col("summary"), message + '\n')}, {where: {id: ctx.request.body.uid}});
            const result = await this.app.model.Users.findByPk(ctx.request.body.uid)
            const dataList = {
              list: { id: result.id, money: result.money, msg: message },
            };
            await this.ctx.render('money/money3.tpl', dataList);
          } catch(e) {
            message = "輸入金額超出範圍"
            const dataList = {
              list: { id: result.id, money: result.money, msg: message },
            };
            await this.ctx.render('money/money3.tpl', dataList);
          }
        }
      }
    }
  }

module.exports = ConcludeController;