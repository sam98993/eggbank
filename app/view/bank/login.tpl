<html>

  <head>

    <title>登入</title>
  
  </head>
  
  <body>
  
    <ul class = "login-view view">
  
      <form action = "../checkLogin" method = "POST" name = "myform">
  
        <p>帳號：<input type =" text" name = "username" id = "username"></p>
        <p>密碼：<input type = "password" name = "password" id = "password"></p>
        <p><input type = "submit" value = "確認">
        <input type = "button" value = "註冊" onclick = "location.href = '../register'"></p>
        
      </form>
  
    </ul>
  
  </body>

</html>