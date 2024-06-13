const Service = require('egg').Service

class SyncService extends Service {
  async syncRedisToMysql() {
    const script = `
      local content = redis.call('GET', KEYS[1])
      if content then
        redis.call('DEL', KEYS[1])
      end
      return content
    `

    const msg_str = await this.app.redis.eval(script, 1, 'content')

    if (!msg_str) {
      console.log('金額無變動')
    } else {
      const myArray = new Array()
      const mySet = new Set()
      const msg_split = msg_str.split('\n')

      for (let i = 0; i < msg_split.length - 1; i++) { 
        const msg_JSON = JSON.parse(msg_split[i])

        myArray.push(msg_JSON)
      }

      await this.app.model.Summaries.bulkCreate(myArray)

      for (let i = 0; i < myArray.length; i++) {
        mySet.add(myArray[i]['user_id'])
      }
      
      const mySet_array = Array.from(mySet)

      for (const id of mySet_array) {
        const user = await this.app.redis.hgetall(`bank_account:${id}`)
    
        await this.app.model.BankAccounts.update({ money: user.money }, {
          where: { user_id: id }
        })
      }
    }
  }
}

module.exports = SyncService
