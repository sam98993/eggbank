const Service = require('egg').Service

class UsersService extends Service {
  async if_no_account (result, account) {
    const script = `
      local user_key = KEYS[1]
      redis.call('HSET', user_key, 'money', ARGV[1])
    `

    if (!account.money) {
      const transaction = await this.app.model.BankAccounts.sequelize.transaction({
        isolationLevel: this.app.model.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
      })
  
      try {
        const data = await this.app.model.BankAccounts.findAll({ 
          where: { user_id: result.id },
          transaction: transaction
        })
  
        const key = `bank_account:${data[0].user_id}`
        const money = data[0].money
  
        await this.app.redis.eval(script, 1, key, money)
  
        await transaction.commit()
      } catch (error) {
        await transaction.rollback()
  
        throw error
      }
    }
  }

  async if_no_summary (result, sum) {
    let message = ''
    let mode = ''
    let arr = []
    const script = `
      local user_key = KEYS[1]
      redis.call('SET', user_key, ARGV[1])
    `

    if (sum === null || sum === undefined) {
      const transaction = await this.app.model.Summaries.sequelize.transaction({
        isolationLevel: this.app.model.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
      })
  
      try {
        const contents = await this.app.model.Summaries.findAll({
          where: { user_id: result.id },
          limit: 20,
          order: [['id', 'DESC']],
          transaction: transaction
        })
        
        for (const content of contents) {
          if (content.mode === 1) {
            mode = '提款'
          } else {
            mode = '存款'
          }
          
          arr.push(`${content.created}：${mode}：${content.changes}元，餘額：${content.balance}元`)
        }
        
        if (contents.length !== 0) {
          message = arr.join('\n')
        }
    
        await this.app.redis.eval(script, 1, `summaries:${result.id}`, message)
  
        await transaction.commit()
      } catch (error) {
        await transaction.rollback()
  
        throw error
      }
    }    
  }

  async loginCheck(username, password) {
    let message = ''
    const result = await this.app.redis.hgetall(`user:${username}`)
    const account = await this.app.redis.hgetall(`bank_account:${result.id}`)
    const sum = await this.app.redis.get(`summaries:${result.id}`)

    if (result.password === password) {
      await this.if_no_account(result, account)

      await this.if_no_summary(result, sum)

      const dataList = {
        list: { 
          id: result.id, 
          name: result.name
        },
      }
  
      await this.ctx.render('bank/loginCheck.tpl', dataList)
    } else if (username === '' || password === '') {
      message = { msg: '欄位不能為空' }
  
      await this.ctx.render('bank/message.tpl', message)
    } else {
      const user = await this.app.model.Users.findAll({ 
        where: { username: username }
      })

      if (user[0]) {
        if (user[0].password === password) {
          await this.app.redis.hset(`user:${user[0].username}`, { 
            'id': user[0].id, 
            'password': user[0].password,
            'name': user[0].name
          })

          await this.if_no_account(user[0], account)

          await this.if_no_summary(user[0], sum)

          const dataList = {
            list: { 
              id: user[0].id, 
              name: user[0].name
            },
          }
    
          await this.ctx.render('bank/loginCheck.tpl', dataList)
        } else {
          message = { msg: '登入失敗' }
    
          await this.ctx.render('bank/message.tpl', message)
        }
      } else {
        message = { msg: '登入失敗' }
    
        await this.ctx.render('bank/message.tpl', message)
      }
    }
  } 

  async registerCheck(username, password, name) {
    let message = ''
    const result = await this.app.redis.hgetall(`user:${username}`)
    const account = await this.app.redis.hgetall(`bank_account:${result.id}`)

    if (!result.id) {
      const member = await this.app.model.Users.findAll({ 
        where: { username: username }
      })

      if (!member[0]) {
        if (username !== '' && password !== '' && name !== '') {
          await this.app.model.Users.create({        
            username: username, 
            password: password, 
            name: name             
          })
      
          const user = await this.app.model.Users.findAll({ 
            where: { username: username } 
          })

          await this.app.redis.hset(`user:${username}`, {
            'id': user[0].id, 
            'password': password, 
            'name': name 
          })  
      
          await this.app.model.BankAccounts.create({           
            money: 0, 
            user_id: user[0].id             
          })

          await this.app.redis.hset(`bank_account:${user[0].id}`, { 'money': 0 })
      
          message = { msg: `${name} 註冊成功` }
      
          await this.ctx.render('bank/message.tpl', message)
        } else {
          message = { msg: '欄位不能為空' }
            
          await this.ctx.render('bank/message.tpl', message)
        }
      } else if (member[0].username === username) {
        await this.app.redis.hset(`user:${member[0].username}`, { 
          'id': member[0].id, 
          'password': member[0].password,
          'name': member[0].name
        })

        await this.if_no_account(member[0], account)

        message = { msg: '此帳號已存在' }

        await this.ctx.render('bank/message.tpl', message)  
      }
    } else {
      await this.if_no_account(result, account)

      message = { msg: '此帳號已存在' }
  
      await this.ctx.render('bank/message.tpl', message)  
    }
  }
}

module.exports = UsersService
