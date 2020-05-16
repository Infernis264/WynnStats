module.exports.board = leaderboard;
module.exports.start = update;
const request = require("request");

var last_interval = {};
var errorMsg = "The Wynncraft API is not giving a valid response at the moment. Try to use this command later";

function leaderboard(pagenum,callback) {
	let pagenums = Number(pagenum);
	if (!pagenums||pagenums<=0||pagenums>=11) {
		callback(`"${pagenum}" is not a number between 1 and 10`);
		return;
	}
	request({url:"https://api.wynncraft.com/public_api.php?action=statsLeaderboard&type=guild&timeframe=alltime",json:true},(err,res,dat)=>{
		if (res.statusCode>=500||res.statusCode===404) {
			callback(errorMsg);
			return;
		}
		if (!err&&res.statusCode===200&&!dat.code) {
			let data = dat.data;
			let finalstring = "```diff\n";
			let page = (Number(pagenum)-1)*10;
			for (var xx = page; xx < (page+10); xx++) {
				if (data[xx].territories===undefined) {
					return;
				}
				let temp = "";
				if (!last_interval[data[xx].name]) {
					temp+="+";
				} else {
					switch(true) {
						case last_interval[data[xx].name]>data[xx].num:
							temp+="+";
						break;
						case last_interval[data[xx].name]<data[xx].num:
							temp+="-";
						break;
						default:
							temp+="=";
						break;
					}
				}
				temp += "["+data[xx].num+"] "+data[xx].name+" ["+data[xx].prefix+"]";
				
				let tempnum =  31-temp.length;
				for (let i = 0; i <= tempnum; i++) {
					temp+=" ";
				}
				temp+="| Territories: "+data[xx].territories;
				let tempnum2 = 3-data[xx].territories.toString().length;
				for (let i = 0; i <= tempnum2; i++) {
					temp+=" ";
				}
				temp+="| Level: "+data[xx].level+"\n";
				finalstring+=temp;
			}
			finalstring+="```";
			callback(finalstring);
		}
	})
}

function update() {
	request({url:"https://api.wynncraft.com/public_api.php?action=statsLeaderboard&type=guild&timeframe=alltime",json:true},(err,res,dat)=>{
		if (!err&&res.statusCode===200&&!dat.error) {
			let data = dat.data;
			if (!data) {
				return;
			}
			last_interval = {};
			data.forEach(guild=>{
				last_interval[guild.name] = guild.num;
			})
		}
	})
}

setInterval(update,7200000);