const Controller = require('egg').Controller

class SummariesController extends Controller {
    async searchByUserId() {
      const { ctx } = this
      const data = { id: ctx.params.uid }
      
      await this.ctx.render('bank/searchByUserId.tpl', data)    
    }

    async search() {
      const { ctx } = this
      const id = ctx.request.body.uid
      const startDate = ctx.request.body.startDate
      const endDate = ctx.request.body.endDate
      const mode = ctx.request.body.mode
      const compare = ctx.request.body.compare
      const changes = ctx.request.body.changes

      await this.service.summaries.search(id , startDate, endDate, mode, compare, changes)    
    }
  }

module.exports = SummariesController
