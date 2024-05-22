const Service = require('egg').Service

class SummariesService extends Service {

  async search(id, date) {

    const { Op } = require('sequelize')
    let message = []

    try {

      const startDate = new Date(date)
      const endDate = new Date(startDate.getTime() + 86399999)
      const results = await this.app.model.Summaries.findAll({ 
        
        where: { 
          
          created: { [ Op.between ]: [ startDate, endDate ] }, 
          user_id: id 

        } 
        
      })

      if (results.length === 0) {

        message = "無交易紀錄"

        await this.service.bank.resultMessage(id, message)

      } else {

        for (let i = 0; i < results.length; i++) {

          message.push(results[ i ].content)

        }

        await this.service.bank.resultMessage(id, message)

      }

    } catch(e) {

      message = "日期格式錯誤"

      await this.service.bank.resultMessage(id, message)

    }
  
  }

}

module.exports = SummariesService