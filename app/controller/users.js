const Controller = require('egg').Controller

class UsersController extends Controller {
    async renderLoginPage() {
      await this.ctx.render('bank/login.tpl')
    }

    async checkLogin() {
      const { ctx } = this
      const username = ctx.request.body.username
      const password = ctx.request.body.password
      const result = await this.app.redis.hgetall(`user:${username}`)
      const account = await this.app.redis.hgetall(`bank_account:${result.id}`)
      const summaries = await this.app.redis.get(`summaries:${result.id}`)
      let message = ''

      if (result.password === password) {
        if (!account.money) {
          await this.service.users.createRedisBankAccount(result)
        }

        if (summaries === null || summaries === undefined) {
          await this.service.users.createRedisSummaries(result)
        }

        const dataList = {
          list: { 
            id: result.id, 
            name: result.name
          }
        }
  
        await this.ctx.render('bank/checkLogin.tpl', dataList)
      } else if (username === '' || password === '') {
        message = { message: '欄位不能為空' }
  
        await this.ctx.render('bank/message.tpl', message)
      } else {
        const user = await this.app.model.Users.findAll({ 
          where: { username: username }
        })

        if (user[0]) {
          if (user[0].password === password) {
            await this.service.users.createRedisUser(user[0])
  
            if (!account.money) {
              await this.service.users.createRedisBankAccount(user[0])
            }
  
            if (summaries === null || summaries === undefined) {
              await this.service.users.createRedisSummaries(user[0])
            }
  
            const dataList = {
              list: { 
                id: user[0].id, 
                name: user[0].name
              },
            }
      
            await this.ctx.render('bank/checkLogin.tpl', dataList)
          } else {
            message = { message: '登入失敗' }
      
            await this.ctx.render('bank/message.tpl', message)
          }
        } else {
          message = { message: '登入失敗' }
      
          await this.ctx.render('bank/message.tpl', message)
        }
      }
    }

    async renderRegisterPage() {
      await this.ctx.render('bank/register.tpl')
    }

    async checkRegister() {
      const { ctx } = this
      const username = ctx.request.body.username
      const password = ctx.request.body.password
      const name = ctx.request.body.name
      const result = await this.app.redis.hgetall(`user:${username}`)
      const account = await this.app.redis.hgetall(`bank_account:${result.id}`)
      let message = ''

      if (!result.id) {
        const user = await this.app.model.Users.findAll({ 
          where: { username: username }
        })
  
        if (!user[0]) {
          if (username !== '' && password !== '' && name !== '') {
            await this.service.users.createMySQLNewUser(username, password, name, message)

            message = { message: `${name} 註冊成功` }

            await this.ctx.render('bank/message.tpl', message)
          } else {
            message = { message: '欄位不能為空' }
            
            await this.ctx.render('bank/message.tpl', message)
          }
        } else if (user[0].username === username) {
          await this.service.users.createRedisUser(user[0])
  
          if (!account.money) {
            await this.service.users.createRedisBankAccount(user[0])
          }
  
          message = { message: '此帳號已存在' }

          await this.ctx.render('bank/message.tpl', message)
        }    
      } else {
        if (!account.money) {
          await this.service.users.createRedisBankAccount(result)
        }

        message = { message: '此帳號已存在' }
  
        await this.ctx.render('bank/message.tpl', message)  
      }
    }
  }

module.exports = UsersController
