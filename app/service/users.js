const Service = require('egg').Service

class UsersService extends Service {
  async createRedisBankAccount (result) {
    const data = await this.app.model.BankAccounts.findAll({ 
      where: { user_id: result.id },
    })

    const key = `bank_account:${data[0].user_id}`
    const money = data[0].money

    await this.app.redis.hset(key, 'money', money)
  }

  async createRedisSummaries (result) {
    const summaries = []
    let totalSummaries = ''
    let mode = ''

    const contents = await this.app.model.Summaries.findAll({
      where: { user_id: result.id },
      limit: 20,
      order: [['id', 'DESC']],
    })
    
    for (const content of contents) {
      if (content.mode === 1) {
        mode = '提款'
      } else {
        mode = '存款'
      }
      
      summaries.push(`${content.created}：${mode}：${content.changes}元，餘額：${content.balance}元`)
    }
    
    if (contents.length !== 0) {
      totalSummaries = summaries.join('\n')
    }

    await this.app.redis.set(`summaries:${result.id}`, totalSummaries)
  }

  async createRedisUser(user) {
    await this.app.redis.hset(`user:${user.username}`, { 
      'id': user.id, 
      'password': user.password,
      'name': user.name
    })
  }

  async createMySQLNewUser(username, password, name, message) {
    const transaction = await this.app.model.BankAccounts.sequelize.transaction({
      isolationLevel: this.app.model.Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
    })

    try {
      const user = await this.app.model.Users.create({        
        username: username, 
        password: password, 
        name: name             
      }, { transaction })

      await this.app.redis.hset(`user:${user.username}`, {
        'id': user.id, 
        'password': user.password, 
        'name': user.name 
      })  
  
      await this.app.model.BankAccounts.create({           
        money: 0, 
        user_id: user.id             
      }, { transaction })
  
      await this.app.redis.hset(`bank_account:${user.id}`, { 'money': 0 })

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()

      if (error.name === 'SequelizeUniqueConstraintError') {
        message = { message: '此帳號已存在' }

        await this.ctx.render('bank/message.tpl', message)

        throw new Error('Username already exists')
      }

      try {
        await this.app.redis.del(`user:${user.username}`)
        await this.app.redis.del(`bank_account:${user.id}`)
      } catch (redisError) {
        console.error('Redis rollback failed:', redisError)
      }

      throw error
    }
  }
}

module.exports = UsersService
