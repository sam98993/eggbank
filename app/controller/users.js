const Controller = require('egg').Controller;

class UsersController extends Controller {
    async login() {
      await this.ctx.render('bank/login.tpl');
    }

    async check() {
      const { ctx } = this;
      const results = await this.service.users.show()
      for (let i = 0; i < results.length; i++) {
        if (results[i].username === ctx.request.body.username && results[i].password === ctx.request.body.password) {
          const dataList = {
            list: { id: results[i].id, name: results[i].name },
          };
          await this.ctx.render('bank/loginCheck.tpl', dataList);
          break
        } else if (ctx.request.body.username === "" || ctx.request.body.password === "") {
          const message = {msg: "欄位不能為空"}
          await this.ctx.render('bank/message.tpl', message);
        } else {
          const message = {msg: "登入失敗"}
          await this.ctx.render('bank/message.tpl', message);
        }
      } 
    }

    async bank() {
      const { ctx } = this;
      var message = ""
      const result = await this.service.users.find(ctx.request.body.uid)
      if (result.summary !== "") {
        message = result.summary
      } else {
        message = "尚無交易紀錄"
      }
      const dataList = {
        list: [
          { id: 1, title: '提款', url: 'withdraw', uid: result.id, money: result.money, msg: message },
          { id: 2, title: '存款', url: 'deposit', uid: result.id },
        ],
      };
      await this.ctx.render('bank/bank.tpl', dataList);
    }

    async withdraw() {
      const { ctx } = this;
      const result = await this.service.users.find(ctx.params.uid)
      if (result.money <= 0) {
        const message = "餘額不足"
        const dataList = {
          list: { id: result.id, money: result.money, msg: message },
        };
        await this.ctx.render('bank/result.tpl', dataList);
      } else {
        const dataList = {
          list: { id: result.id, money: result.money },
        };
        await this.ctx.render('bank/withdraw.tpl', dataList);
      }
    }

    async deposit() {
      const { ctx } = this;
      const result = await this.service.users.find(ctx.params.uid)
      const dataList = {
        list: { id: result.id, money: result.money },
      };
      await this.ctx.render('bank/deposit.tpl', dataList);
    }

    async result() {
      const Sequelize = require('sequelize');
      const { ctx } = this;
      var message = ""
      const haveDecimalPoint = ctx.request.body.num2 % 1
      const result = await this.service.users.find(ctx.request.body.uid)
      if (ctx.params.mode === "1") {
        if (ctx.request.body.num2 > result.money){
          message = "提款金額不可高過餘額"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('bank/result.tpl', dataList);
        } else if( haveDecimalPoint !== 0 || parseInt(ctx.request.body.num2) === NaN){
          message = "輸入金額出現錯誤"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('bank/result.tpl', dataList);
        } else if(ctx.request.body.num2 < 0){
          message = "提款金額不可為負數"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('bank/result.tpl', dataList);
        } else {
          message = '提款金額為：' + ctx.request.body.num2 + '元，所剩餘額為：' + ctx.request.body.txtResult + '元'
          const { money, summary } = {money: ctx.request.body.txtResult, summary: Sequelize.fn('CONCAT', Sequelize.col("summary"), message + '\n')}
          await this.service.users.update({ money, summary }, ctx.request.body.uid)
          const result = await this.service.users.find(ctx.request.body.uid)
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('bank/result.tpl', dataList);
        }
      } else {
        if (haveDecimalPoint !== 0 || parseInt(ctx.request.body.num2) === NaN){
          message = "輸入金額出現錯誤"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('bank/result.tpl', dataList);
        } else if (ctx.request.body.num2 < 0) {
          message = "存款金額不可為負數"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('bank/result.tpl', dataList);
        } else {
          try {
            message = '存款金額為：' + ctx.request.body.num2 + '元，所剩餘額為：' + ctx.request.body.txtResult + '元'
            const { money, summary } = {money: ctx.request.body.txtResult, summary: Sequelize.fn('CONCAT', Sequelize.col("summary"), message + '\n')}
            await this.service.users.update({ money, summary }, ctx.request.body.uid)
            const result = await this.service.users.find(ctx.request.body.uid)
            const dataList = {
              list: { id: result.id, money: result.money, msg: message },
            };
            await this.ctx.render('bank/result.tpl', dataList);
          } catch(e) {
            message = "輸入金額超出範圍"
            const dataList = {
              list: { id: result.id, money: result.money, msg: message },
            };
            await this.ctx.render('bank/result.tpl', dataList);
          }
        }
      }
    }
  }

module.exports = UsersController;