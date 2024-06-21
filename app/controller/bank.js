const Controller = require('egg').Controller

class BankController extends Controller {
    async renderHomepage() {
      const { ctx } = this
      const id = ctx.request.body.uid

      const result = await this.app.redis.hgetall(`bank_account:${id}`)
      const money = result.money

      const script = await this.service.bank.setScriptForMessage()
      const message = await this.app.redis.eval(script, 1, `summaries:${id}`)

      const dataList = {
        list: [        
          { 
            id: 1, 
            title: '提款', 
            url: 'withdraw', 
            uid: id,            
          }, { 
            id: 2, 
            title: '存款', 
            url: 'deposit', 
            uid: id
          }, {             
            id: 3, 
            title: '搜尋', 
            url: 'setSearchingConditions', 
            uid: id
          }
        ],
        money: money, 
        message: message
      }
  
      await this.ctx.render('bank/homepage.tpl', dataList)
    }

    async renderTransactionPage() {      
      const { ctx } = this
      const id = ctx.params.uid
      const mode = ctx.params.mode
      const data = { id: id }

      if (mode === '1') {        
        await this.ctx.render('bank/withdraw.tpl', data)
      } else {
        await this.ctx.render('bank/deposit.tpl', data)
      }      
    }

    async calculateResult() {
      const { ctx } = this
      const id = ctx.request.body.uid
      const input = ctx.request.body.num
      let mode = ctx.params.mode
      let message = await this.service.bank.checkErrorMessage(id, input, mode)

      if (message !== '') {
        await this.service.bank.showResultMessage(id, message)
      } else {
        const balance = await this.service.bank.updateBankAccount(id, input, mode)
        const content = await this.service.bank.setContent(id, input, mode, balance)

        if (mode === '1') {
          mode = '提款'
        } else {
          mode = '存款'
        }

        const summaries = await this.service.bank.updateSummaries(id, input, mode, balance) 

        await this.service.bank.appendLogger(id, balance, summaries, content)

        message = `${mode}金額為：${input}元，所剩餘額為：${balance}元`
          
        await this.service.bank.showResultMessage(id, message)
      }
    }
  }
    
module.exports = BankController
