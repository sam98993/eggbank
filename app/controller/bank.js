const Controller = require('egg').Controller

class BankController extends Controller {
    async bank() {
      const { ctx } = this
      const id = ctx.request.body.uid

      await this.service.bank.home(id)
    }

    async transaction() {      
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

    async result() {
      const { ctx } = this
      const mode = ctx.params.mode
      const id = ctx.request.body.uid
      const input = ctx.request.body.num
      let message = await this.service.bank.errorMessage(id, input, mode)

      if (message !== '') {
        await this.service.bank.resultMessage(id, message)
      } else {
        message = await this.service.bank.update(id, input, mode, message)
          
        await this.service.bank.resultMessage(id, message)
      }
    }
  }
    
module.exports = BankController
