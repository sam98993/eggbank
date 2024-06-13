<html>

  <head>

    <title>存款</title>
    
  </head>

  <body>

    <ul class = "deposit-view view">

      <form action = "../../result/2" method = "POST" name = "myform">

        <p>請輸入存款金額：
        <input name = "num"> 
        &nbsp
        <input type = "submit" value = "Enter"></p>

        <input type = "hidden" id = "uid" name = "uid" value = "{{ id }}">

      </form>

    </ul>

  </body>

</html>
