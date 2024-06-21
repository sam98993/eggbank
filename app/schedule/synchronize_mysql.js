const Subscription = require('egg').Subscription

class SynchronizeMySQL  extends Subscription {
  static get schedule() {
    return {
      interval: '5m',
      type: 'all'
    }
  }

  async subscribe() {
    const contentLength = await this.app.redis.llen('content')

    if (contentLength === 0) {
      console.log('金額無變動')
    } else {
      const totalSummaries = []
      const ids = new Set()

      for (let i = 0; i < contentLength; i++) {
        const content = await this.app.redis.rpop('content')
        const contentJSON = await this.service.syncService.syncRedisSummariesToMySQL(content, totalSummaries)

        await this.service.syncService.getIds(contentJSON, ids)
      }

      const idsArray = Array.from(ids)

      for (let id of idsArray) {
        await this.service.syncService.syncRedisBankAccountToMySQL(id)
      }

      await this.app.model.Summaries.bulkCreate(totalSummaries)
    }

    console.log('MySQL與Redis已完成同步\n')
  }
}

module.exports = SynchronizeMySQL
