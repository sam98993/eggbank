const Controller = require('egg').Controller;

class LoginCheckController extends Controller {
    async list() {
      const { ctx } = this;
      // const results = await this.app.mysql.select('users')
      const results = await this.app.model.Users.findAll()
      for (let i=0; i<results.length; i++) {
        if (results[i].username==ctx.request.body.username && results[i].password==ctx.request.body.password) {
          const dataList = {
            list: { id: results[i].id, name: results[i].name },
          };
          await this.ctx.render('money/loginCheck.tpl', dataList);
          break
        } else if (ctx.request.body.username=="" || ctx.request.body.password=="") {
          const message = {msg: "欄位不能為空"}
          await this.ctx.render('money/message.tpl', message);
        } else {
          const message = {msg: "登入失敗"}
          await this.ctx.render('money/message.tpl', message);
        }
      } 
    }
  }

module.exports = LoginCheckController;