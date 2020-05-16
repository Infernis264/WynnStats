module.exports.monitor = monitor;
module.exports.startup = startup;
module.exports.right = right;
const request = require("request");
const find = require("./findPlayer.js");

Array.prototype.equals = function (array) {
    if (!array) {
        return false;
    }
    if (this.length != array.length) {
        return false;
    }
    for (let qqq = 0, lll=this.length; qqq < lll; qqq++) {
        if (this[qqq] instanceof Array && array[qqq] instanceof Array) {
            if (!this[qqq].equals(array[qqq])) {
                return false;       
            }
        }           
        else if (this[qqq] != array[qqq]) { 
            return false;   
        }           
    }       
    return true;
}

Object.defineProperty(Array.prototype, "equals", {enumerable: false});

var currentworld = "";
var prev;
var warworld = [];
var iterations = 0
var watch = {};
var done = [];

function right(terrs,call) {
	request({url:"https://api.wynncraft.com/public_api.php?action=onlinePlayers",json:true},(err,res,dat)=>{
		if (!err&&res.statusCode===200&&!dat.error) {
			let keys = Object.keys(dat);
			let vals = Object.values(Object.values(dat));
			let prevkeys = Object.keys(prev);
			let prevvals = Object.values(prev);
			let nostop = true;
			for (var xd = keys.length - 1; xd >= 0; xd--) {
				if (keys[xd].includes("WC")&&nostop) {
					currentworld = keys[xd];
					nostop = false;
				}
			}
			call("","",currentworld);
			for (var i = 1; i < keys.length; i++) {
				if (keys[i].includes("WAR")) {
					if (watch[keys[i]]===undefined) {
						watch[keys[i]] = vals[i];
					}
					if (!watch[keys[i]].equals(vals[i])&&!done.includes(keys[i])&&keys[i]) {
						let worrr = keys[i];
						let pname = vals[i];
						if (pname.length>=1) {
							let cont = true;
							request({url:"https://api.wynncraft.com/public_api.php?action=playerStats&command="+pname[0],json:true},(e,r,d)=>{
								if (!err&&res.statusCode===200&&!dat.error) {
									for (var l = 0; l < pname.length; l++) {
										find.findraw(pname[l],prev,(world)=>{
											if (cont&&world&&d.guild) {
												let guildp = d.guild.name;
												let count = "";
												Object.values(terrs).forEach((ter)=>{
													if (ter.attacker==guildp) {
														count=ter.territory;
													}
												});
												if (warworld.indexOf(world)===-1) {
													warworld.push(world);
													timedDelete(world);
												}
												if (pname.length===1) {
													call("__"+pname+"__ **["+guildp+"]**: `"+world+"` \\→ `"+worrr+"`",warworld,currentworld);
													done.push(worrr);
													cont = false;
												}
												if (pname.length===2) {
													call("__"+pname[0]+"__ and __"+pname[1]+"__ **["+guildp+"]**: `"+world+"` \\⇉ `"+worrr+"`",warworld,
														currentworld);
													done.push(worrr);
													cont = false;
												}
												if (pname.length>2) {
													let fin = "";
													for (var j = 0; j < pname.length-1; j++) {
														fin+="__"+pname[j]+"__, ";
													}
													fin+="and __"+pname[pname.length-1]+"__ **["+guildp+"]**: `"+world+"` \\⇶ `"+worrr+"`";
													call(fin,warworld,currentworld);
													done.push(worrr);
													cont = false;
												}
											}
										});
									}
								}
							});
						}
					} else {
						if (done.includes(keys[i])) {
							if (!keys.includes(done)) {
								done.splice(done.indexOf(keys[i]),1);
							}
						}
					}
				}
			}
			setTimeout(function() {
				prev = dat;
			},20000);
		}
	});
}
function monitor(callback) {
	request({url:"https://api.wynncraft.com/public_api.php?action=onlinePlayers",json:true},(err,res,dat)=>{
		let keys = Object.keys(dat);
		let vals = Object.values(dat);
		let cont = true;
		keys.forEach(key=>{
			if (prev[key]==undefined) {
				if(key.toLowerCase().includes("war")) {
					find.findraw(Array.from(dat[key])[0],prev,wor=>{
						warworld = wor;
						iterations = 0;
						callback(wor);
					});
				}
			}
		});
		if (iterations>=8) {
			startup((err)=>{
				callback(warworld);
			});
			iterations = 0;
		} else {
			callback(warworld);
			iterations++;
		}
		prev = dat;
	});
}

function startup(cb) {
	request({url:"https://api.wynncraft.com/public_api.php?action=onlinePlayers",json:true},(err,res,dat)=>{
		prev = dat;
		let keys = Object.keys(dat);
		if (warworld===undefined) {
			let worll = Array.from(Object.keys(dat));
			for (var i = 1; i < worll.length; i++) {
				if (worll[keys.length-i].includes("WC")) {
					warworld = worll[keys.length-i];
					if (cb) {
						cb();
					}
					return;
				}
			}
		}
	});
}

function timedDelete(worldIndex) {
	setTimeout(function(){
		warworld.splice(warworld.indexOf(worldIndex),1);
	},900000);
}