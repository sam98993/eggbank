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
      const dataList = await this.service.bank.transaction(id)

      if (mode === "1") {        
        await this.ctx.render('bank/withdraw.tpl', dataList)
      } else {
        await this.ctx.render('bank/deposit.tpl', dataList)
      }      
    }

    async result() {
      const { ctx } = this
      const mode = ctx.params.mode
      const id = ctx.request.body.uid
      const input = ctx.request.body.num2
      const left = ctx.request.body.txtResult
      let message = await this.service.bank.errorMessage(id, input, mode)

      if (message !== "") {
        await this.service.bank.resultMessage(id, message)
      } else {
        message = await this.service.bank.update(id, mode, input, left, message)
          
        await this.service.bank.resultMessage(id, message)
      }
    }
  }
    
module.exports = BankController