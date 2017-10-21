var linebot = require('linebot');
var express = require('express');
var request = require("request");
var cheerio = require("cheerio");  //核心為jQuery，安裝後可使用selector
//var fs = require("fs"); //fs 則是 NodeJS 的檔案系統模組，包含讀取、刪除、寫入、更名等等的檔案操作，此範例沒用到

var bot = linebot({
    channelID: '1542004169',
    channelSecret: '0b5948facafe2536f6d0266facffb0bb',
    channelAccessToken: 'Knz7Un1voBEUe+67UN97PKW6/60CHL+f+lFoMCXgG5M8lHQ2aQPwCt4QeQwIVEMZONVQvfqxaKESsztGR7fnERnp8SIMmlP6Nxr2r4sIw6j41ScooMDPHzX/f6KVu4Zxp2M0DqkbsoaRkkTJis5YbAdB04t89/1O/w1cDnyilFU='
});

var result = [];
var resultLocation = [];
var timer;
var timer2;
_fubonIndex();
_fubonLocal();
_bot();


const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() { //heroku聽預設port；local端聽8080
  var port = server.address().port;
  console.log("App now running on port", port);
});

function _fubonIndex() {
  result = [];
  clearTimeout(timer);
  request({url: "https://www.fubon.com/financialholdings/home/index.html",
    url: "https://tw.yahoo.com/",
    method: "GET"
  }, function(error, response, body) {  //callback function
    if (error || !body) {
      return;
    } else {
      var $ = cheerio.load(body);  //把整個網頁原始碼爬出來
	  
	  $(".m-media-message").each(function(e, i){
          result.push($(this).text().split('\n')); //將爬出的所有東西裝到result 陣列中
      });
	  
	  console.log('result[0] =' + result[0]);
	  console.log('result[1] =' + result[1]);
	  console.log('result[2] =' + result[2]);
	  console.log('result[3] =' + result[3]);
	  
	  
	  timer = setInterval(_fubonIndex, 1000*60*5);  //每5分鐘爬一次網站更新資料

	  //申請的帳號為開發者帳號才能免費使用reply API
      if (result[0] != 'TAIPEI' && result[1] != 'SHANGHAI' && result[2] != 'HONG KONG' && result[3] != 'SINGAPORE') {
		var dt = new Date();
		var checkTime = '上次檢查時間：' + dt + '\n\n' + '警告!!!目前檢測到富邦金控首頁服務不正常，請立即確認系統服務!';
		
        bot.push('Uc359588e24b1edf31173ae19459205a5', checkTime);  //使用者ID要透過API取得，非一般的LINE ID
        bot.push('U9b87b069c473f5550e3c3ed1756931b0', checkTime);  //使用者ID要透過API取得，非一般的LINE ID
		
      }
    }
  });
}

function _fubonLocal() {
  resultLocation = [];
  clearTimeout(timer2);
  request({
    url: "https://www.fubon.com/Fubon_Portal/financialholdings/location/mapM.jsp?bu=M",
    url: "https://tw.yahoo.com/",
    method: "GET"
  }, function(error, response, body) {  //callback function
    if (error || !body) {
      return;
    } else {
      var $ = cheerio.load(body);  //把整個網頁原始碼爬出來
	  
	  $(".m-button.m-button-map.ng-map").each(function(e, i){
          resultLocation.push($(this).text().split('\n')); //將爬出的所有東西裝到result 陣列中
      });
	  //console.log('resultLocation[0] =' + resultLocation[0]);
	  
	  timer2 = setInterval(_fubonLocal, 1000*60*5);  //每5分鐘爬一次網站更新資料

	  //申請的帳號為開發者帳號才能免費使用reply API
	  
      if (resultLocation[0] != '台北市105敦化南路一段108號 10樓') {
		var dt = new Date();
		var checkTime = '上次檢查時間：' + dt + '\n\n' + '警告!!! 目前檢視到AP Server服務不正常，請立即確認主機服務情況!';
		
        bot.push('Uc359588e24b1edf31173ae19459205a5', checkTime);  //使用者ID要透過API取得，非一般的LINE ID
        bot.push('U9b87b069c473f5550e3c3ed1756931b0', checkTime);  //使用者ID要透過API取得，非一般的LINE ID
		
      }
	  
    }
  });
}

function _bot() {
    bot.on('message', function(event) {
		if (event.message.type == 'text') {
			var msg = event.message.text;  //取得使用者輸入的文字
			var replyMsg = '';
			if (msg == '檢視AP Server'){
				var dt = new Date();
				if (resultLocation[0] == '台北市105敦化南路一段108號 10樓') {
					replyMsg = '上次檢查時間：' + dt + '\n\n' + 'AP Server服務正常唷';
				}else{
					replyMsg = '上次檢查時間：' + dt + '\n\n' + '警告!!!目前檢測到AP Server服務不正常，請立即確認系統服務!';
				}
			}else if (msg == '檢視Web Server') {
				var dt = new Date();
				if (result[0] == 'TAIPEI' && result[1] == 'SHANGHAI' && result[2] == 'HONG KONG' && result[3] == 'SINGAPORE'){
					replyMsg = '上次檢查時間：' + dt + '\n\n' + 'Web Server服務正常唷';
				}else{
					replyMsg = '上次檢查時間：' + dt + '\n\n' + '警告!!!目前檢測到富邦金控首頁服務不正常，請立即確認系統服務!';
				}
			}else if(msg == '我'){
				event.source.profile().then(function (profile) {
					console.log(profile.displayName = profile.userId);
					return event.reply('Hello ' + profile.displayName + ' ' + profile.userId);
				});
			}
			event.reply(replyMsg).then(function(data) {
				console.log(replyMsg);
			}).catch(function(error) {
				console.log('error');
			});
		}else if (event.message.type == 'sticker') {
			event.reply({ type: 'text', text: '你好啊~有事嗎' });
		}
    });
}
