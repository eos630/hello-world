var linebot = require('linebot');
var express = require('express');

var bot = linebot({
 channelID: '1542004169',
 channelSecret: '0b5948facafe2536f6d0266facffb0bb',
 channelAccessToken: 'Knz7Un1voBEUe+67UN97PKW6/60CHL+f+lFoMCXgG5M8lHQ2aQPwCt4QeQwIVEMZONVQvfqxaKESsztGR7fnERnp8SIMmlP6Nxr2r4sIw6j41ScooMDPHzX/f6KVu4Zxp2M0DqkbsoaRkkTJis5YbAdB04t89/1O/w1cDnyilFU='
});

bot.on('message', function(event) {
  console.log(event); //把收到訊息的 event 印出來看看
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});