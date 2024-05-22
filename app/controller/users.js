const Controller = require('egg').Controller

class UsersController extends Controller {

    async login() {

      await this.ctx.render('bank/login.tpl')

    }

    async loginCheck() {

      const { ctx } = this
      const username = ctx.request.body.username
      const password = ctx.request.body.password
      
      await this.service.users.loginCheck(username, password)

    }

    async register() {

      await this.ctx.render('bank/register.tpl')

    }

    async registerCheck() {

      const { ctx } = this
      const username = ctx.request.body.username
      const password = ctx.request.body.password
      const name = ctx.request.body.name
      
      await this.service.users.registerCheck(username, password, name)

    }

  }

module.exports = UsersController