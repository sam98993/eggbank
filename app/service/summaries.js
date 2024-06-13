const Service = require('egg').Service
const { Op } = require('sequelize')

class SummariesService extends Service {
  async search(id , startDate, endDate, mode, compare, changes) {
    let message = []
    let results = ''

    if (compare === '>') {
      compare = Op.gt
    } else if (compare === '=') {
      compare = Op.eq
    } else if (compare === '<') {
      compare = Op.lt
    } else if (compare === '>=') {
      compare = Op.gte
    } else {
      compare = Op.lte
    }

    if (mode === '3') {
      mode = [1, 2]
    }
    
    try {
      results = await this.app.model.Summaries.findAll({
        where: { 
          user_id: id, 
          created: { 
            [ Op.between ]: [ startDate, endDate ] 
          }, 
          mode: mode,
          changes: {
            [ compare ]: changes
          }
        },
        order: [['id', 'DESC']]
      })

      for (const result of results) {
        if (result.mode === 1) {
          mode = '提款'
        } else {
          mode = '存款'
        }
        message.push(`${result.created}：${mode}：${result.changes}元，餘額：${result.balance}元`)
      }

      if (message.length === 0) {
        message = '無交易紀錄'

        await this.service.bank.resultMessage(id, message)
      } else {
        message = message.join('\n')

        await this.service.bank.resultMessage(id, message)
      }
    } catch (error) {
      message = '格式錯誤'

      await this.service.bank.resultMessage(id, message)
    }  
  }
}

module.exports = SummariesService
