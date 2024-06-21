const Service = require('egg').Service
const dateFormat = require('dateformat')

class BankService extends Service {
  async setScriptForMessage() {
    const script = `
      local message = redis.call('GET', KEYS[1])
      if message == '' then
        message = '尚無交易紀錄'
      else
        if string.find(message, '###') then
          message = string.gsub(message, '###', '\\n')
          redis.call('SET', KEYS[1], message)
        end
      end
      return message
    `
    
    return script
  }

  async checkErrorMessage(id, input, mode) {
    const haveDecimalPoint = input % 1
    let message = ''
    const result = await this.app.redis.hgetall(`bank_account:${id}`)
    const money = Number(result.money)

    if (haveDecimalPoint !== 0 || parseInt(input) === NaN) {
      message = '輸入金額出現錯誤'
    } else if (input < 0) {
      message = '存款金額不可為負數'
    } else if (input === '') {
      message = '欄位不可為空'
    } else if (mode === '1') {
      if (input > money && money > 0) {
        message = '提款金額不可高過餘額'
      } else if (input > money && money <= 0) {
        message = '餘額不足'
      }     
    } else if (mode === '2') {
      if (input > 2147483647) {
        message = '輸入金額超出範圍'
      } 
    } 

    return message
  }

  async showResultMessage(id, message) {
    const dataList = {
      list: {        
        id: id, 
        message: message      
      }
    }

    await this.ctx.render('bank/result.tpl', dataList)
  }

  async updateBankAccount(id, input, mode) {
    const changes = Number(input)

    let increment = 0
    if (mode === '1') {
      increment = -changes
    } else {
      increment = changes
    }
    
    const balance = await this.app.redis.hincrby(`bank_account:${id}`, 'money', increment)

    return balance
  }

  async setContent(id, input, mode, balance) {
    const content = {
      "created":`${Date()}`,
      "mode":`${mode}`,
      "changes":`${input}`,
      "balance":`${balance}`,
      "user_id":`${id}`
    }

    const contentString = `${JSON.stringify(content)}\n`

    await this.app.redis.lpush('content', contentString)

    return content
  }

  async updateSummaries(id, input, mode, balance) {
    const script = `
      local key = KEYS[1]
      local value = redis.call('GET', key)
      local lines = {}
      for line in string.gmatch(value, '[^\\n]+') do
          table.insert(lines, line)
      end
      table.insert(lines, 1, ARGV[1])
      if #lines > 20 then
        table.remove(lines)
      end
      value = table.concat(lines, '\\n')
      redis.call('SET', key, value)
      return value
    `

    const date = dateFormat(new Date(), 'yyyy-mm-dd')
    const summary = `${date}：${mode}：${input}元，餘額：${balance}元`

    const summaries = await this.app.redis.eval(script, 1, `summaries:${id}`, summary)

    return summaries
  }

  async appendLogger(id, balance, summaries, content) {
    const replacedSummaries = summaries.replace(/\n/g, '###')

    const logger = this.app.getLogger('RBLogger')

    const commandToHsetBankAccount = `hset bank_account:${id} money ${balance}`
    const commandToLpushContent = `lpush content \'${JSON.stringify(content)}\'`
    const commandToSetSummaries = `set summaries:${id} ${replacedSummaries}`

    logger.info(commandToHsetBankAccount)
    logger.info(commandToLpushContent)
    logger.info(commandToSetSummaries)
  }
}

module.exports = BankService
