<html>


  <head>

    <title>搜尋明細</title>

  </head>

  <body>

    <ul class = "search-view view">
      
      <form action = "../../search" method = "POST" name = "myform">

        <p>交易模式：
        <input name = "mode">
        &nbsp
        提款請輸入1，存款請輸入2，兩種都要請輸入3</p>

        <p>交易金額：
        <input name = "compare">
        &nbsp
        請輸入>、=、<、>=、<=
        <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
        <input name = "changes">
        &nbsp
        請輸入金額</p>
        
        <p>搜尋日期：
        <input name = "startDate">
        &nbsp~&nbsp
        <input name = "endDate">
        &nbsp
        <input type = "submit" value = "Enter"></p>

        <p>格式：XXXX-XX-XX，範例：2024-05-20</p>

        <input type = "hidden" id = "uid" name = "uid" value = "{{ id }}">

      </form>

    </ul>

  </body>

</html>
