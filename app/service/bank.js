const Service = require('egg').Service

class BankService extends Service {
  async home(id) {
    let message = ""
    const bankAccountsModel = this.app.model.BankAccounts
    const result = await this.app.model.Users.findByPk(id, {       
      include: [ bankAccountsModel ]     
    })
    const money = result.bank_account.money
    const summary = result.bank_account.summary

    if (summary !== "") {
      message = summary
    } else {
      message = "尚無交易紀錄"
    }

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

  async transaction(id) {
    const bankAccountsModel = this.app.model.BankAccounts
    const summariesModel = this.app.model.Summaries
    const result = await this.app.model.Users.findByPk(id, {      
      include: [ bankAccountsModel, summariesModel ]     
    })
    const money = result.bank_account.money

    const dataList = {
      list: {        
        id: id, 
        money: money      
      },
    }

    return dataList
  }

  async errorMessage(id, input, mode) {
    const haveDecimalPoint = input % 1
    let message = ""
    const bankAccountsModel = this.app.model.BankAccounts
    const summariesModel = this.app.model.Summaries
    const result = await this.app.model.Users.findByPk(id, {
      include: [ bankAccountsModel, summariesModel ] 
    })

    if (haveDecimalPoint !== 0 || parseInt(input) === NaN) {
      message = "輸入金額出現錯誤"
    } else if (input < 0) {
      message = "存款金額不可為負數"
    } else if (input === "") {
      message = "欄位不可為空"
    } else if (mode === "1") {
      if (input > result.bank_account.money && result.bank_account.money > 0) {
        message = "提款金額不可高過餘額"
      } else if (input > result.bank_account.money && result.bank_account.money <= 0) {
        message = "餘額不足"
      }     
    } else if (mode === "2") {
      if (input > 2147483647) {
        message = "輸入金額超出範圍"
      } 
    } else {
      message = message
    }

    return message
  }

  async resultMessage(id, message) {
    const dataList = {
      list: {        
        id: id, 
        msg: message      
      },
    }

    await this.ctx.render('bank/result.tpl', dataList)
  }

  async update(id, mode, input, left, message) {
    const Sequelize = require('sequelize')

    if (mode === "1") {
      message = '提款金額為：' + input + '元，所剩餘額為：' + left + '元'
    } else {
      message = message = '存款金額為：' + input + '元，所剩餘額為：' + left + '元'
    }

    await this.app.model.BankAccounts.update({       
      money: left, 
      summary: Sequelize.fn('CONCAT', Sequelize.col("summary"), message + '\n')    
    }, {      
      where: { id: id }     
    })

    await this.app.model.Summaries.create({      
      content: message, 
      created: Date().toLocaleString('zh-TW', { timeZone: 'Taiwan/Taipei' }), 
      user_id: id    
    })

    return message
  }
}

module.exports = BankService