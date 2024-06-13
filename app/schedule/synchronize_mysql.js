const Subscription = require('egg').Subscription

class SynchronizeMysql extends Subscription {
  static get schedule() {
    return {
      interval: '5m',
      type: 'all'
    }
  }

  async subscribe() {
    await this.ctx.service.syncService.syncRedisToMysql()
    console.log('MySQL與Redis已完成同步\n')
  }
}

module.exports = SynchronizeMysql
