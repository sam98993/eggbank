<html>

  <head>

    <title>存款</title>
    
  </head>

  <body>

    <ul class = "deposit-view view">

      <form action = "../../result/2" method = "POST" name = "myform">

        <p>請輸入存款金額：
        <input name = "num2"> 
        &nbsp
        <input type = "submit" value = "Enter" onclick = "calculate()"></p>

        <script>

        function calculate(){

          var num1 = parseInt(document.myform.num1.value)
          var num2 = parseInt(document.myform.num2.value)

          document.myform.txtResult.value=num1+num2
          
        }

        </script>

        <input type = "hidden" id = "num1" name = "num1" value = "{{ list.money }}">
        <input type = "hidden" id = "uid" name = "uid" value = "{{ list.id }}">
        <input name = "txtResult" type = "hidden" id = "txtResult" autocomplete = "off">

      </form>

    </ul>

  </body>

</html>
