const Controller = require('egg').Controller;

class ConcludeController extends Controller {
    async list() {
      const fs = require('node:fs')
      const { ctx } = this;
      var message = ""
      // const result = await this.app.mysql.get('users', { id: ctx.request.body.uid })
      const result = await this.app.model.Users.findByPk(ctx.request.body.uid)
      if (ctx.params.mode==1) {
        if (ctx.request.body.num2>result.money){
          message = "提款金額不可高過餘額"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else if(ctx.request.body.num2%1 != 0 || parseInt(ctx.request.body.num2) == NaN){
          message = "輸入金額出現錯誤"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else if(ctx.request.body.num2<0){
          message = "提款金額不可為負數"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else {
          // await this.app.mysql.update('users', { id: ctx.request.body.uid, money: ctx.request.body.txtResult});
          await this.app.model.Users.update({money: ctx.request.body.txtResult}, {where: {id: ctx.request.body.uid}});
          // const result = await this.app.mysql.get('users', { id: ctx.request.body.uid })
          const result = await this.app.model.Users.findByPk(ctx.request.body.uid)
          fs.appendFile(result.name+'.txt', '提款金額為：NT$'+ctx.request.body.num2+'，所剩餘額為：NT$'+result.money+'\n', err => {
            if (err) {
              console.error(err);
              return
            } 
          })
          message = '提款金額為：NT$'+ctx.request.body.num2+'，所剩餘額為：NT$'+result.money
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        }
      } else {
        if (ctx.request.body.num2%1 != 0 || parseInt(ctx.request.body.num2) == NaN){
          message = "輸入金額出現錯誤"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else if (ctx.request.body.num2<0) {
          message = "存款金額不可為負數"
          const dataList = {
            list: { id: result.id, money: result.money, msg: message },
          };
          await this.ctx.render('money/money3.tpl', dataList);
        } else {
          try {
            // await this.app.mysql.update('users', { id: ctx.request.body.uid, money: ctx.request.body.txtResult});
            await this.app.model.Users.update({money: ctx.request.body.txtResult}, {where: {id: ctx.request.body.uid}});
            // const result = await this.app.mysql.get('users', { id: ctx.request.body.uid })
            const result = await this.app.model.Users.findByPk(ctx.request.body.uid)
            fs.appendFile(result.name+'.txt', '存款金額為：NT$'+ctx.request.body.num2+'，所剩餘額為：NT$'+result.money+'\n', err => {
              if (err) {
                console.error(err);
                return
              } 
            })
            message = '存款金額為：NT$'+ctx.request.body.num2+'，所剩餘額為：NT$'+result.money
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