<html>

  <head>

    <title>交易明細</title>

  </head>

  <body>

    <ul class = "result-view view">
      
      <form action = "../bank" method = "POST" name = "myform">
    
        <p style = "white-space: pre-line">{{ list.message }}</p>
          
        <p><input type = "submit" value = "回首頁"></p>
        
        <input type = "hidden" id = "uid" name = "uid" value = "{{ list.id }}">
      
      </form>
    
    </ul>
  
  </body>

</html>