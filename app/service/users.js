const Service = require('egg').Service

class UsersService extends Service {
  async loginCheck(username, password) {
    let message = ""
    const results = await this.app.model.Users.findAll()

    for (let i = 0; i < results.length; i++) {
      if (results[ i ].username === username && results[ i ].password === password) {
        const dataList = {
          list: { 
            id: results[ i ].id, 
            name: results[ i ].name 
          },
        }

        await this.ctx.render('bank/loginCheck.tpl', dataList)

        break
      } else if (username === "" || password === "") {
        message = { msg: "欄位不能為空" }

        await this.ctx.render('bank/message.tpl', message)
      } else {
        message = { msg: "登入失敗" }

        await this.ctx.render('bank/message.tpl', message)
      }
    } 
  }

  async registerCheck(username, password, name) {
    let message = ""
    const results = await this.app.model.Users.findAll()

    for (let i = 0; i < results.length; i++) {
      if (results[ i ].username !== username) {
        if (username !== "" && password !== "" && name !== "") {
          await this.app.model.Users.create({        
            username: username, 
            password: password, 
            name: name             
          })
    
          const user = await this.app.model.Users.findAll({              
            where: { username: username }            
            })
    
          await this.app.model.BankAccounts.create({           
            money: 0, 
            summary: "", 
            user_id: user[0].id             
          })
    
          message = { msg: name + " 註冊成功" }
    
          await this.ctx.render('bank/message.tpl', message)
  
          break
        } else {
          message = { msg: "欄位不能為空" }
            
          await this.ctx.render('bank/message.tpl', message)
        }
      } else {
        message = { msg: "此帳號已存在" }

        await this.ctx.render('bank/message.tpl', message)  
        }
      }
    } 
  }

module.exports = UsersService