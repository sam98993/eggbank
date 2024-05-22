<html>

  <head>

    <title>交易明細</title>

  </head>

  <body>

    <ul class = "message-view view">
      
      <form action = "../bank" method = "POST" name = "myform">
        
        {% for item in list.msg %}
          
          {% if item|length == 1 %}
            
            {{ item }}
          
          {% else %}
            
            <p style = "white-space: pre-line">{{ item }}</p>
          
          {% endif %}
        
        {% endfor %}
        
        <p><input type = "submit" value = "回首頁"></p>
        
        <input type = "hidden" id = "uid" name = "uid" value = "{{ list.id }}">
      
      </form>
    
    </ul>
  
  </body>

</html>