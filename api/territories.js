const express = require("express");
const app = express();
const request = require("request");
const fs = require("fs");
const prefix = require("./prefix.js");
const banner = require("./img.js");

var terHistory = [];
var cData = {};
var guilds = Object.values(prefix.prefix);

Object.defineProperty(Object.prototype, "getProp", {
	value: function (prop) {
		var key,self = this;
		if (this[prop]) {
			return this[prop];
		}
		for (key in self) {
			if (key.toLowerCase() == prop.toLowerCase()) {
				return self[key];
			}
		}
		return false;
	},
	enumerable: false
});

Array.prototype.diff = function(a) {
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

app.use(express.static('territories'));

app.get('/', (req, res) => {
	res.sendFile('index.html', {root: __dirname+"/territories"});
});

app.get("/banner", (req,res)=>{
	guilds = Object.values(prefix.prefix);
	let guild = req.query.g;
	if (!guild) {
		res.end("no");
	}
	if (guilds.includes(guild)) {
		request({url:"https://api.wynncraft.com/public_api.php?action=guildStats&command="+guild.replace(/ /g,"%20"),json:true}, (err,resp,dat)=>{
			if (!err&&resp.statusCode===200&&!dat.error) {
				if (dat.banner) {
					banner.makeBanner(dat.banner, (image)=>{
						res.writeHead(200, {
							"Content-Type": "image/png",
							"Content-Length": image.length
						});
						res.end(image); 
					});
				} else {
					res.writeHead(200, {
						"Content-Type": "image/png",
						"Content-Length": banner.noBanner.length
					});
					res.end(banner.noBanner); 
				}
			} else {
				res.writeHead(200, {
					"Content-Type": "image/png",
					"Content-Length": banner.noBanner.length
				});
				res.end(banner.noBanner); 
			}
		})
	} else {
		res.writeHead(200, {
			"Content-Type": "image/png",
			"Content-Length": banner.noBanner.length
		});
		res.end(banner.noBanner); 
	}
});

app.get("/territoryCount", (req,res)=>{
	let difference = req.query.difference;
	let time = req.query.time;
	if (time==="debug") {
		res.end(JSON.stringify(terHistory,null,4));
		return;
	}
	for(let i = 0; i<terHistory.length; i++) {
		if (terHistory[i].timestamp==time) {
			if(difference==="on") {
				let keys = Object.keys(terHistory[i]);
				let currentKeys = Object.keys(cData);
				let currentClone = Object.assign({},cData);
				let prevClone = Object.assign({},terHistory[i]);
				let response = {};
				currentKeys.diff(keys).forEach(kye=>{
					prevClone[kye] = 0;
					keys.push(kye);
				});
				keys.diff(currentKeys).forEach(kye=>{
					currentClone[kye] = 0;
					currentKeys.push(kye);
				});
				for(let l = 0; l < currentKeys.length;l++) {
					response[keys[l]] = currentClone[keys[l]]-prevClone[keys[l]];
				}
				res.end(JSON.stringify(response));
			} else {
				res.end(JSON.stringify(terHistory[i]));
			}
		}
	}
});

app.get("/prefix", (req,res)=>{
	res.end(JSON.stringify(prefix.prefix));
});

app.get("/reverseprefix", (req,res)=>{
	res.end(JSON.stringify(prefix.rePrefix));
});

function getRecord(cb) {
	request({url:"https://api.wynncraft.com/public_api.php?action=territoryList",json:true},(err,res,dat)=>{
		if (!err&&res.statusCode===200&&!dat.error) {
			let ter = {};
			let vals = Object.values(dat.territories);
			vals.forEach(val=>{
				if (ter[val.guild]) {
					ter[val.guild]+=1;
				} else {
					ter[val.guild]=1;
				}
			});
			ter.timestamp = 0;
			cb(ter);
		} else {
			cb({error:"Wynncraft API Error: API unreachable at this time",timestamp:0});
		}
	});
}

function current() {
	getRecord(entry=>{
		cData = entry;
	});
	let file = JSON.stringify(terHistory,null,4);
	fs.writeFile("pastTerritories.json",file,err=>{
		if (err) {
			console.log(err);
		}
	});
}

function update() {
	shift(()=>{
		getRecord(entry=>{
			terHistory.push(entry);
		});
	});
}

function init() {
	getRecord(entry=>{
		terHistory.push(entry);
	});
}

function shift2(cb) {
	for(let i = 0; i<terHistory.length; i++) {
		if (i>=97) {
			terHistory.splice(96);
		}
		terHistory[i].timestamp+=1;
	}
	cb();
}

function shift(cb) {
	let i = 0;
	terHistory.forEach(g=>{
		if (g.timestamp>=97) {
			terHistory.splice(96);
			return;
		}
		terHistory[i].timestamp+=1;
		i++;
	})
	cb();
}

setInterval(function () {
	guilds = Object.values(prefix.prefix);
},65000)

setInterval(update, 900000);
setInterval(current, 60000);
init();

app.listen("8080", "127.0.0.1");