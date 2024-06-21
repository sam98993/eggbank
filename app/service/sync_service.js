const Service = require('egg').Service

class SyncService extends Service {
  async syncRedisSummariesToMySQL(content, totalSummaries) {
    const contentJSON = JSON.parse(content)

    totalSummaries.push(contentJSON)

    return contentJSON
  }

  async getIds(content, ids) {
    const id = content.user_id
        
    ids.add(id)
  }

  async syncRedisBankAccountToMySQL(id) {
    const user = await this.app.redis.hgetall(`bank_account:${id}`)

    await this.app.model.BankAccounts.update({ money: user.money }, {
      where: { user_id: id }
    })
  }
}

module.exports = SyncService
