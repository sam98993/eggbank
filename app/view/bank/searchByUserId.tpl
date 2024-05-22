<html>


  <head>

    <title>搜尋明細</title>

  </head>

  <body>

    <ul class = "search-view view">
      
      <form action = "../../searchByDate" method = "POST" name = "myform">

        <p>請輸入搜尋明細之日期：
        <input name = "date">
        &nbsp
        <input type = "submit" value = "Enter"></p>

        <p>格式：XXXX-XX-XX</p>
        <p>範例：2024-05-20</p>
        
        <input type = "hidden" id = "uid" name = "uid" value = "{{ id }}">

      </form>

    </ul>

  </body>

</html>
