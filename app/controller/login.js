const Controller = require('egg').Controller;

class LoginController extends Controller {
    async list() {
      await this.ctx.render('money/login.tpl');
    }
  }

module.exports = LoginController;