<html>
  <head>
    <title>Egg Bank</title>
  </head>
  <body>
    <ul class="money-view view">
      {% for item in list %}
      <li class="item">
        <p><input type="button" id="money{{ item.id }}" name="money{{ item.id }}" value="{{ item.title }}" onclick="location.href='../{{ item.url }}/{{ item.uid }}';"/></p>
      </li>
      {% endfor %}
      <p>帳戶餘額：NT${{list[0].money}}</p>
      <p>交易紀錄：</p>
      <p style="white-space: pre-line">{{list[0].msg}}</p>
      <a href="login" onclick="if (confirm('確定要登出嗎？')){return true;}else{event.stopPropagation(); event.preventDefault();};">(登出)</a>
    </ul>
  </body>
</html>
