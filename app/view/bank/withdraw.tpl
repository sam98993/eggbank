<html>

  <head>

    <title>提款</title>

  </head>

  <body>

    <ul class = "withdraw-view view">
      
      <form action = "../../result/1" method = "POST" name = "myform">
        
        <p>請輸入提款金額：
        <input name = "num"> 
        &nbsp
        <input type = "submit" value = "Enter"></p>
        
        <input type = "hidden" id = "uid" name = "uid" value = "{{ id }}">
      
      </form>
    
    </ul>
  
  </body>

</html>
