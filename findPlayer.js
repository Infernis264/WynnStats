module.exports.find = find;
module.exports.findraw = findRAW;
module.exports.currentPlayers = currentPlayers;
const request = require("request");

var currentPlayers = [];
var currentPlayersRaw = [];

String.prototype.escape = function () {
	return this.replace(/_/g,"\\_");
}

function find(player,cb) {
	let brk = false;
	currentPlayers = [];
	let worlds = Array.from(Object.keys(currentPlayersRaw));
	let tempnum = 0;
	Object.values(currentPlayersRaw).forEach((val)=>{
		Object.values(val).forEach((pls)=>{
			if (pls.toString().toLowerCase().includes(player.toLowerCase())&&!brk) {
				cb(`${pls.toString().escape()} is on world ${worlds[tempnum]}`);
				brk = true;
			}
		});
		tempnum++;
	});
	if (!brk) {
		cb(`${player.escape()} is not online.`);
	}
}

function findRAW(player,playerlist,cb) {
	let worlds = Array.from(Object.keys(playerlist));
	let worldval = Object.values(playerlist);
	let tempnum = 0;
	let cont = true;
	worldval.forEach(world=>{
		if (cont) {
			if (Array.from(world).includes(player)) {
				if(worlds[tempnum].includes("WAR")) {} else {
					cb(worlds[tempnum]);
					cont = false;
				}
			}
			tempnum++;
		}
	})
	cb(false);
}

function update() {
	request({url:"https://api.wynncraft.com/public_api.php?action=onlinePlayers",json:true},(err,res,dat)=>{
		if (!err&&res.statusCode===200&&!dat.error) {
			currentPlayersRaw = dat;
			currentPlayers = [];
			Object.values(dat).forEach((val)=>{
				Object.values(val).forEach((pls)=>{
					currentPlayers.push(pls);
				});
			});
			module.exports.currentPlayers = currentPlayers;
		}
	})
}

update();
setInterval(update,60000);