<html>

  <head>

    <title>登入</title>

  </head>

  <body>

    <ul class = "loginCheck-view view">
      
      <form action = "../bank" method = "POST" name = "myform">
        
        <p>{{ list.name }} 登入成功！</p>

        <p><input type = "submit" value = "確認"></p>
        
        <input type = "hidden" name = "uid" id = "uid" value = {{ list.id }}>
      
      </form>
    
    </ul>
  
  </body>

</html>