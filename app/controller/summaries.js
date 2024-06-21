const Controller = require('egg').Controller

class SummariesController extends Controller {
    async renderSetSearchingConditionsPage() {
      const { ctx } = this
      const data = { id: ctx.params.uid }
      
      await this.ctx.render('bank/setSearchingConditions.tpl', data)    
    }

    async sendSearchResults() {
      const { ctx } = this
      const id = ctx.request.body.uid
      const startDate = ctx.request.body.startDate
      const endDate = ctx.request.body.endDate
      const compare = ctx.request.body.compare
      const changes = ctx.request.body.changes
      let message = []
      let mode = ctx.request.body.mode

      if (mode === '3') {
        mode = [1, 2]
      }

      const comparisonOperator = await this.service.summaries.setComparisonOperator(compare)
      
      try {
        const results = await this.service.summaries.searchResults(id , startDate, endDate, mode, comparisonOperator, changes)
        
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
  
          await this.service.bank.showResultMessage(id, message)
        } else {
          message = message.join('\n')
  
          await this.service.bank.showResultMessage(id, message)
        }
      } catch (error) {
        message = '格式錯誤'
  
        await this.service.bank.showResultMessage(id, message)
      }
    }
  }

module.exports = SummariesController
