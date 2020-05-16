var prefix = {error:""};
var rePrefix = {error:""};

module.exports.prefix = prefix;
module.exports.rePrefix = rePrefix;

const request = require("request");
const fs = require("fs");

Array.prototype.diff = function(a) {
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function getJSON(file, callback) {
	fs.readFile(file, (err,data) => {
		if (err) {
			console.log(err,data);
		}
		callback(JSON.parse(data));
	})
}

function update(cb) {
	request({url:"https://api.wynncraft.com/public_api.php?action=guildList",json:true},(err,res,dat)=>{
		if (!err&&res.statusCode===200&&!dat.error) {
			let current = dat.guilds;
			let previous = Object.values(prefix);
			newOnes = current.diff(previous);
			if (cb) {
				cb();
			}
		}
	})
}

function init() {
	getJSON("./prefixes/prefix.json",(dat)=>{
		prefix = dat;
		module.exports.prefix = dat;
	});
	getJSON("./prefixes/reversePrefix.json",(dat)=>{
		rePrefix = dat;
		module.exports.rePrefix = dat;
	});
	update(()=>{
		fetch();
	});
}

function fetch() {
	let num = 0;
	if (newOnes.length>10) {
		num = 10;
	} else {
		num = newOnes.length;
	}
	for (var i = 0; i < num; i++) {
		request({url:`https://api.wynncraft.com/public_api.php?action=guildStats&command=${newOnes[i]}`,json:true},(err,res,dat)=>{
			prefix[dat.prefix] = dat.name;
			rePrefix[dat.name] = dat.prefix;
			module.exports.prefix = prefix;
			module.exports.rePrefix = rePrefix;
		})
	}
}

function write() {
	let file = JSON.stringify(prefix,null,4);
	let file2 = JSON.stringify(rePrefix,null,4);
	fs.writeFile("./prefixes/prefix.json",file,err=>{
		if (err) {
			console.log(err);
		}
	});
	fs.writeFile("./prefixes/reversePrefix.json",file2,err=>{
		if (err) {
			console.log(err);
		}
	});
}

setInterval(update,60000);
setInterval(fetch,600000);
setInterval(write,60000);

init();