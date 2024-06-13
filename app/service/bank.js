const Service = require('egg').Service
const dateFormat = require('dateformat')

class BankService extends Service {
  async home(id) {
    const result = await this.app.redis.hgetall(`bank_account:${id}`)
    const money = result.money
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

    const message = await this.app.redis.eval(script, 1, `summaries:${id}`)
    
    const dataList = {
      list: [        
        { 
          id: 1, 
          title: '提款', 
          url: 'withdraw', 
          uid: id, 
          money: money, 
          msg: message           
        }, { 
          id: 2, 
          title: '存款', 
          url: 'deposit', 
          uid: id,
          money: money, 
          msg: message        
        }, {             
          id: 3, 
          title: '搜尋', 
          url: 'searchByUserId', 
          uid: id,
          money: money, 
          msg: message           
        },
      ],
    }

    await this.ctx.render('bank/bank.tpl', dataList)
  }

  async errorMessage(id, input, mode) {
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

  async resultMessage(id, message) {
    const dataList = {
      list: {        
        id: id, 
        msg: message      
      }
    }

    await this.ctx.render('bank/result.tpl', dataList)
  }

  async update(id, input, mode, message) {
    const  script = `
      local user_key = KEYS[1]
      local changes = tonumber(ARGV[1])
      local current_value = tonumber(redis.call('HGET', user_key, 'money'))
      local new_value
      if ARGV[2] == '1' then
        new_value = current_value - changes
      else
        new_value = current_value + changes
      end
      redis.call('HSET', user_key, 'money', new_value)
      return new_value
    `

    const balance = await this.app.redis.eval(script, 1, `bank_account:${id}`, input, mode)
    
    const content = {
      "created":`${Date()}`,
      "mode":`${mode}`,
      "changes":`${input}`,
      "balance":`${balance}`,
      "user_id":`${id}`
    }

    const content_str = `${JSON.stringify(content)}\n`

    await this.app.redis.append('content', content_str)

    const script2 = `
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

    if (mode === '1') {
      mode = '提款'
    } else {
      mode = '存款'
    }

    const date = dateFormat(new Date(), 'yyyy-mm-dd')
    const sum = `${date}：${mode}：${input}元，餘額：${balance}元`

    const value = await this.app.redis.eval(script2, 1, `summaries:${id}`, sum)
    const new_value = value.replace(/\n/g, '###')

    const logger = this.app.getLogger('RBLogger')

    const command1 = `hset bank_account:${id} money ${balance}`
    const command2 = `append content \'${JSON.stringify(content)}\'`
    const command3 = `set summaries:${id} ${new_value}`

    logger.info(command1)
    logger.info(command2)
    logger.info(command3)

    message = `${mode}金額為：${input}元，所剩餘額為：${balance}元`

    return message
  }
}

module.exports = BankService
