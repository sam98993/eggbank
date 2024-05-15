<html>
  <head>
    <title>交易明細</title>
  </head>
  <body>
    <ul class="message-view view">
      <form action="../money" method="POST" name="myform">
        <p style="white-space: pre-line">{{list.msg}}</p>
        <input type="hidden" id="uid" name="uid" value="{{ list.id }}" />
        <input type="submit" value="回首頁"/>
      </form>
    </ul>
  </body>
</html>