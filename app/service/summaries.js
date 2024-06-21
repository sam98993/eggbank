const Service = require('egg').Service
const { Op } = require('sequelize')

class SummariesService extends Service {
  async setComparisonOperator(compare) {
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
    return compare
  }

  async searchResults(id , startDate, endDate, mode, compare, changes) {
    const results = await this.app.model.Summaries.findAll({
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

    return results
  }
}

module.exports = SummariesService
