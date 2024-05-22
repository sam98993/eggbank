const Controller = require('egg').Controller

class SummariesController extends Controller {

    async searchByUserId() {

      const { ctx } = this
      const data = { id: ctx.params.uid }
      
      await this.ctx.render('bank/searchByUserId.tpl', data)
    
    }

    async searchByDate() {

      const { ctx } = this
      const id = ctx.request.body.uid
      const date = ctx.request.body.date

      await this.service.summaries.search(id , date)
    
    }

  }

module.exports = SummariesController