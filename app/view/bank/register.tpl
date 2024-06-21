<html>

  <head>

    <title>註冊</title>
  
  </head>
  
  <body>
  
    <ul class = "register-view view">
  
      <form action = "../checkRegister" method = "POST" name = "myform">
  
        <p>帳號：<input type =" text" name = "username" id = "username"></p>
        <p>密碼：<input type = "text" name = "password" id = "password"></p>
        <p>名字：<input type = "text" name = "name" id = "name"></p>

        <input type = "submit" value = "確認">
        <input type = "button" value = "返回" 
                  onclick = "location.href = '../login'">

      </form>
  
    </ul>
  
  </body>

</html>