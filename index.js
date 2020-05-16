const Discord = require("discord.js");
const IC = require("./itemConstruct.js");
const client = new Discord.Client();
const fs = require("fs");
const formatDate = require("./date.js");
const moment = require("moment");
const find = require("./findPlayer.js");
const request = require("request");
const war = require("./monitorWar.js");
const gstats = require("./gstats.js");
const leader = require("./leaderboard.js");
const imgReq = request.defaults({ encoding: null });
const diff = require("string-similarity");

const help1 = new Discord.RichEmbed()
	.setTitle("Help Page [1/4]")
	.setFooter("*Most names are case sensitive.")
	.addField("/stats [guild name]","Displays the statistics for any of Wynn's guilds, or, if [guild name] is left blank, the default guild. "+
	" (alias: /guild)")
	.addField("/pstats [player name]","Displays the statistics for anyone who plays Wynn. (alias: /player)")
	.addField("/find [player name]","Finds what world a player is on, or if they are offline.")
	.addField("/help [page #] [g]","Dm's you commands for the bot. It shows it in the server if you include a \"g\"")
	.addField("/report [message over 50 characters]","Use this command to report any bugs or issues with the bot.")
	.addField("/change","Shows the change in territories over the last 24 hours.")
	.setColor("#04A500");
const help2 = new Discord.RichEmbed()
	.setTitle("Help Page [2/4]")
	.setFooter("*Most names are case sensitive")
	.setColor("#04A500")
	.addField("/item [partial item name]","Displays any item in Wynncraft")
	.addField("/pdefault [player name]","Sets your default IGN for /pstats")
	.addField("/territories [guild name]","Views all the territories a guild has. If [guild name] is blank, it will do it for the default guild.")
	.addField("/ping","Shows client ping.")
	.addField("/tinfo [territory name]","Shows information about a specific territory.")
	.addField("/gdefault","Sets your default guild")
	.addField("/leaderboard","Shows the Wynncraft leaderboard. Red entries have moved down, Green ones have moved up.");
const help3 = new Discord.RichEmbed()
	.setTitle("Help Page [3/4]")
	.setFooter("*Most names are case sensitive")
	.setColor("#04A500")
	.addField("/pimg [image url]","Sets a custom image for your IGN.")
	.addField("/duel [mention]","Duels the mentioned user.")
	.addField("/chance [number]","Shows your chance of getting a mythic in [number] mob kills.")
	.addField("/mythic [number]","Simulates killing [number] mobs with a 7/1000000 chance to get a mythic")
	.addField("/war (legacy command)","Showed what worlds worked best for wars. Now, wars are mostly fixed.")
	.addField("/count","Shows the current amount of online players at the moment.")
	.addField("/banner [guild name or tag]","Shows the banner for that guild");
const help4 = new Discord.RichEmbed()
	.setTitle("Admin Commands [4/4]")
	.setFooter("*Most names are case sensitive")
	.setColor("#04A500")
	.addField("/botrole [role name (Owner command)]","Sets the rank that gives access to the commands listed in this help dialogue.")
	.addField("/defaultguild [guild name]","Sets the server's default guild")
	.addField("/restrict","Restricts what channels the bot can send messages in to the channel you're in. Do the command again in the same channel to"+
		" unrestrict it.")
	.addField("/togglefeed","Toggles the live guild takeover feed in the current channel. Do the command again in the same channel to turn it off")
	.addField("/logonfeed","Toggles the war server logon feed in the channel you use the command in")
	.addField("/toggle [command]","Toggles commands on or off. Do \"/toggle\" without a command to see the currently disabled commands.");
var gbData = {};
var plData = {};
var prefix = {};
var servers = 0;
var items;
var terrs = {};
var temppppp = {};
var working = [];
var tempstore = {};
var plans = {};
var mythicBlock = {};
var gayBlock = {};
var resetTime = {};
var current = "";
var errorMsg = "The Wynncraft API is not giving a valid response at the moment. Try to use this command later";
var commands = ["/biggay","/ping","/stats","/guild","/gdefault","/item","/warfeed","/territories","/tinfo","/change",
"/defaultguild","/botrole","/guildimg","/kill","/duel","/mythic","/chance","/find","/destroy","/help","/player","/pstats","/pdefault",
"/pimg","/uptime","/war","/togglefeed","/count","/logonfeed","/plan","/leaderboard","/toggle","/sucicide","/banner"]

String.prototype.escape = function () {
	return this.replace(/_/g,"\\_");
}
String.prototype.capital = function (ind1,ind2) {
	let final = [];
	if (ind1) {
		let split = this.split(ind1);
		for (var i = 0; i < split.length; i++) {
			final.push(split[i].slice(0,1).toUpperCase()+split[i].slice(1));
		}
		if (ind2) {
			return final.join(ind2);
		}
		return final.join(" ");
	} else {
		return this.slice(0,1).toUpperCase()+this.slice(1);
	}
}
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

process.on('unhandledRejection', (reason, p) => {
	if (p.code!=10008) {
		console.log(reason.stack);
	}
});

client.on("message", (message)=>{
	if (!message.guild) {
		return;
	}
	let guild = message.guild;
	if (gbData[guild.id]) {
		if (!gbData[guild.id].rank) {
			gbData[guild.id].rank = "null"
		}
		if (!gbData[guild.id].channel) {
			gbData[guild.id].channel = [];
		}
	} else {
		gbData[guild.id] = {rank:"null",channel:[]};
	}
	let split = message.content.split(" ");
	if (message.author.id===client.user.id) {
		return;
	}	
	var botrank = false;
	if (message.author.id!=guild.ownerID) {
		if (message.member) {
			if (message.member.roles.size>1) {
				message.member.roles.forEach((rank)=>{
					if (rank.name===gbData[guild.id].rank) {
						botrank = true;
					}
				});
			}
		}
	} else {
		botrank = true;
	}
	if (gbData[message.guild.id]) {
		if (gbData[message.guild.id].channel) {
			if (gbData[message.guild.id].channel.length>0&&!gbData[message.guild.id].channel.includes(message.channel.id)&&
				split[0]!="/restrict"&&split[0]!="/togglefeed"&&split[0]!="/logonfeed"&&botrank===false) {
				return;
			}
		}
	} else {
		gbData[message.guild.id] = {rank:"null"};
	}
	if (gbData[guild.id].disabled) {
		if (gbData[guild.id].disabled.includes(split[0])) {
			return;
		}
	}
	switch (split[0].toLowerCase()) {
		case "/report":
			if (split.slice(1).join(" ").length>30) {
				if (message.attachments.size>0) {
					imgReq.get(message.attachments.first().proxyURL,(err,res,dat)=>{
						if (!err&&res.statusCode===200) {
							let attachment = new Discord.Attachment(dat);
							client.fetchUser(/* bot owner id */).then((me)=>{
								me.createDM().then(dm=>{
									dm.send(`[${message.author.username}]: ${split.slice(1).join(" ")}`,attachment);
									message.channel.send("Successfully reported your bug/issue.")
								});
							});
						}
					})
				} else {
					client.fetchUser(/* bot owner id */).then((me)=>{
						me.createDM().then(dm=>{
							dm.send(`[${message.author.username}]: ${split.slice(1).join(" ")}`);
							message.channel.send("Successfully reported your bug/issue.")
						});
					});
				}
			} else {
				message.channel.send("Please make your report longer than 30 characters (in an effort to prevent spam).")
			}
		break;
		case "/tobiggay":
			if (!botrank) {
				return;
			}
			if (Number(split[1])) {
				gbData[guild.id].gayblock = 1000*Number(split[1]);
				message.channel.send("The timeout for /biggay will be "+split[1]+" seconds");
			}
		break;			
		case "/biggay":
			if (gayBlock[message.channel.id]) {
				client._timeouts.forEach((to)=>{
					if (to._idleStart===gayBlock[message.channel.id]){
						let left = to._idleTimeout-(client.uptime-to._idleStart);
						message.channel.send(`**${message.author.username}**, you can do \`/biggay\` in this channel in ${(left/1000)-1.5} seconds`)
						.then((msg)=>{
							setTimeout(function () {
								msg.delete();
							},4000);
						});
					}
				});
				return;
			}
			let keys = [];
			guild.members.forEach((member, key)=>{
				if(member.presence.status!="offline"&&(!message.author.bot)){
					keys.push(key);
				}
			})
			message.channel.send("<@"+keys[Math.floor(Math.random()*keys.length)]+"> has big gay");
			blockgay(message.channel.id,gbData[guild.id].gayblock);
		break;
		case "/ping":
			message.channel.send(client.ping+" ms");
		break;
		case "/g":
		case "/stats":
		case "/guild":
			gstats.gstats(prefix,gbData,tempstore,message,plData,terrs);
		break;
		case "/gdefault":
			let VARIABLE = split.slice(1).join(" ");
			if (prefix.getProp(split[1])) {
				VARIABLE = prefix.getProp(split[1]);
			}
			if (plData[message.author.id]) {
				plData[message.author.id].guild = VARIABLE;
			} else {
				plData[message.author.id] = {guild: VARIABLE};
			}
			message.channel.send(`**${message.author.username}**, your default guild was successfully changed to ${VARIABLE}`);
		break;
		case "/i":
		case "/item":
			let joins = split.slice(1).join("%20");
			request({url:`https://api.wynncraft.com/public_api.php?action=itemDB&search=${joins}`,json:true},(err,res,data)=>{
				if (res.statusCode>=500||res.statusCode===404) {
					message.channel.send(errorMsg);
					return;
				}
				if (data.items) {
					if (data.items.length!=0) {
						let lene = 0;
						let cont = true;
						data.items.forEach(item=>{
							if (item.name.toLowerCase()===split.slice(1).join(" ").toLowerCase()) {
								message.channel.send(IC.construct(data.items[lene]));
								cont=false;
							}
							lene++;
						})
						if (cont) {
							message.channel.send(IC.construct(data.items[0]));
						}
					} else {
						message.channel.send("No item could be found with the name \""+split.slice(1).join(" ")+"\"");
					}
				}
			});
		break;
		case "/t":
		case "/territories":
			let join = split.slice(1).join(" ");
			if (!join||!split[1]){
				message.channel.send("You haven't named a guild.");
				return;
			}
			if (split[1]===undefined&&gbData[guild.id].default) {
				join = gbData[guild.id].default;
			}
			if (split[1]===undefined&&plData[message.author.id]) {
				if (plData[message.author.id].guild) {
					join = plData[message.author.id].guild;
				}
			}
			if (split.length===2&&split[1].length===3) {
				if (prefix.getProp(split[1])) {
					join = prefix.getProp(split[1]);
				}
			}
			if (!terrs) {
				message.channel.send(errorMsg);
				return;
			}
			let count = [];
			Object.values(terrs).forEach((ter)=>{
				if (ter.guild===join) {
					count.push(ter.territory);
				}
			});
			count.sort();
			let str = "";
			let temparr = [];
			for (var i = 0; i < count.length; i++) {
				if (i%15===0&&i!=0) {
					temparr.push(str);
					str = "";
				} 
				str+="• "+count[i]+"\n";
				if (i===count.length-1) {
					temparr.push(str);
				}
			}
			let thi = new Discord.RichEmbed()
				.setTitle(`${join}'s territories`)
				.setFooter(count.length+" territories");
			for (var i = 0; i < temparr.length; i++) {
				thi.addField("Page "+(i+1),temparr[i],true);
			}
			message.channel.send(thi);
		break;
		case "/tinfo":
			let terris = [];
			let terrisCap = [];
			Object.values(terrs).forEach(ter=>{
				if (ter.territory) {
					terris.push(ter.territory.toLowerCase());
					terrisCap.push(ter.territory);
				}
			});
			let bestmatch = diff.findBestMatch(split.slice(1).join(" ").toLowerCase(),terris).bestMatch;
			if (bestmatch.rating<.3) {
				message.channel.send("There is no territory by the name of \""+split.slice(1).join(" ")+"\"");
				return 
			}
			let aaa = terrs[terrisCap[terris.indexOf(bestmatch.target)]];
			let te = new Discord.RichEmbed()
				.setTitle(aaa.territory);
			if (aaa.location) {
				te.setDescription("Guild: "+aaa.guild+"\n"+
					"Acquired Date: "+formatDate.formatDate(new Date(aaa.acquired))+"\n"+
					"Current Attacker: "+aaa.attacker+"\n"+
					"Location: X="+(aaa.location.startX+aaa.location.endX)/2+", Y="+(aaa.location.startY+aaa.location.endY)/2);
			} else {
				te.setDescription("Guild: "+aaa.guild+"\n"+
					"Acquired Date: "+formatDate.formatDate(new Date(aaa.acquired))+"\n"+
					"Current Attacker: "+aaa.attacker+"\n"+
					"Location: None (API devs left a nonexistent value instead of placeholders; this breaks things)");
			}
			message.channel.send(te);
		break;
		case "/change":
			request({url:`http://${/* api website name*/}/territoryCount?time=96&difference=on`,json:true},(err,res,dat)=>{
				if (res.statusCode>=500||res.statusCode===404) {
					message.channel.send(errorMsg);
					return;
				}
				if (!err&&res.statusCode===200) {
					let change = new Discord.RichEmbed();
					let keys = Object.keys(dat);
					let final = "";
					keys.forEach(ter=>{
						if (ter==="timestamp") {
							return;
						}
						switch(true) {
							case dat[ter]>0:
								final+=ter+": +"+dat[ter]+"\n";
							break;
							case dat[ter]<0:
								final+=ter+": "+dat[ter]+"\n";
							break;
							case dat[ter]===0:
								final+=ter+": ±"+dat[ter]+"\n";
							break;
						}
					});
					change.setTitle("Territory Change in the last 24 hours:");
					change.setDescription(final);
					message.channel.send(change);
				}
			})
		break;
		case "/reset":
			if (!botrank) {
				return;
			}
			message.channel.send("Are you sure you want to clear all preferences for this server? "+
				"(includes default channels, restricted channels, feed channels, and bot roles) Type \"yes\" or \"no\" within the next 30 seconds.");
			resetTime[message.channel.id] = message.guild.id;
			timedRemove(message);
		break;
		case "/defaultguild":
			if (!botrank) {
				return;
			}
			if (prefix.getProp(split[1])) {
				join = prefix.getProp(split[1]);
			}
			if (gbData[guild.id]) {
				gbData[guild.id].default = split.slice(1).join(" ");
			} else {
				gbData[guild.id] = {default:split.slice(1).join(" ")};
			}
			message.channel.send(`The default guild for ${guild.name} was successfully changed to ${split.slice(1).join(" ")}`);
		break;
		case "/botrole":
			if (guild.ownerID===message.author.id) {
				if (gbData[guild.id]) {
					gbData[guild.id].rank = split[1];
				} else {
					gbData[guild.id] = {rank:split[1]};
				}
				message.channel.send(`The bot rank ${split[1]} was successfully set up.`);
			} else {
				message.channel.send("You aren't authorized to use this command.");
			}
		break;
		case "/duel":
			if (message.mentions.members.size>0) {
				let arr = [];
				message.mentions.members.forEach(mem=>{
					arr.push(mem.user.username);
				});
				arr.push(message.author.username);
				let fin = "";
				let random = arr[Math.floor(Math.random()*arr.length)];
				arr.splice(arr.indexOf(random),1);
				if (arr.length<=1) {
					fin+="**"+arr[0]+"**";
				} else {
					for (var j = 0; j < arr.length-1; j++) {
						fin+="**"+arr[j]+"**, ";
					}
					fin+="and **"+arr[arr.length-1]+"**";
				}
				message.channel.send(`**${random}** has brutally slain ${fin}`)
			}
		break;
		case "/mythic":
			if (mythicBlock[message.author.id]) {
				client._timeouts.forEach((to)=>{
					if (to._idleStart===mythicBlock[message.author.id]){
						let left = to._idleTimeout-(client.uptime-to._idleStart);
						message.channel.send(`**${message.author.username}**, you can do \`/mythic\` again in ${(left/1000)-1.5} seconds`).then((msg)=>{
							setTimeout(function () {
								msg.delete();
							},4000);
						});
					}
				});
				return;
			}
			if (Number(split[1])&&(Number(split[1])<=1000000)) {
				let num = 0;
				for (var i = 0; i < Number(split[1]); i++) {
					let rand = Math.floor(Math.random()*(142857));
					if (rand===420) {
						num++;
					}
				}
				message.channel.send(`**${message.author.username}** you killed ${split[1]} mobs and got ${num} mythic${num===1?"":"s"}.`);
				if (Number(split[1])>500000) {
					block(message.author.id,15000);
				} else if (Number(split[1])>200000) {
					block(message.author.id,10000);
				} else {
					block(message.author.id,1000);
				}
			} else {
				message.channel.send(`You can't kill ${split[1]} mobs.`)
			}
		break;
		case "/chance":
			if (Number(split[1])) {
				let chance = 1-Math.pow(0.999993,Number(split[1]));
				message.channel.send(`**${message.author.username}** you have a ${(1-Math.pow(0.999993,Number(split[1])))*100}% chance to get 1 mythic.`);
			} else {
				message.channel.send(split[1]+"is not a number.")
			}
		break;
		case "/find":
			find.find(split[1],wor=>{
				message.channel.send(wor);
			});
		break;
		case "/help":
			let helpmsg = ""; 
			switch (split[1]) {
				case "1":
					helpmsg = help1;
				break;
				case "2":
					helpmsg = help2;
				break;
				case "3":
					helpmsg = help3;
				break;
				case "4":
					helpmsg = help4;
				break;
				default:
					helpmsg = help1;
				break;
			}
			if (split[2]==="g") {
				message.channel.send(helpmsg);
			} else {
				message.author.createDM().then(dm=>{
					dm.send(helpmsg);
					message.react("419996689848467456");
				})
			}
		break;
		case "/player":
		case "/pstats":
			let tempbool = false;
			let avatar;
			if (plData[message.author.id]) {
				if (plData[message.author.id].ign) {
					if (split[1]===undefined) {
						split[1] = plData[message.author.id].ign;
					}
					if (plData[message.author.id].img) {
						tempbool = true;
					}
				}
			}
			let url = `https://api.wynncraft.com/v2/player/${split[1]}/stats`;
			request({url:url,json:true},(err,res,data)=>{
				if (res.statusCode>=500||res.statusCode===404) {
					message.channel.send(errorMsg);
					return;
				} else {
					if (data.code!=200) {
						if (split[1]!=undefined&&split[1]!="") {
							message.channel.send(`Statistics for ${split[1]} couldn't be found. Check spelling and capitalization.`);
							return;
							
						} else {
							message.channel.send("**"+message.author.username+"** you haven't named anyone, if you want to set up your default ign, do `/pdefault [player name]`");
							return;
						}
					}
				}
				if (!err&&res.statusCode===200&&!data.error) {
					data = data.data[0];
					let rank = "";
					let classes = "";
					let toggle = 0;
					if (data.meta.tag.value) {
						rank = "["+data.meta.tag.value+"] ";
					}
					for (let i = 0; i < data.classes.length; i++) {
						if (toggle%2===0) {
							let temp = Object.values(data.classes)[i];
							classes+="Lvl "+temp.level+" "+temp.name.replace(/[0-9]/g,"").capital()+(data.classes.length-1===i?"":" \u2574".repeat(4));
							toggle++;
						} else {
							let temp = Object.values(data.classes)[i];
							classes+="Lvl "+temp.level+" "+temp.name.replace(/[0-9]/g,"").capital()+"\n";
							toggle++;
						}
					}
					if (tempbool) {
						avatar = plData[message.author.id].img;
					} else {
						avatar = `https://minotar.net/helm/${split[1]}`;
					}
					let embed = new Discord.RichEmbed()
						.setThumbnail(avatar)
						.setTitle(`${rank+split[1]}'s Wynncraft Stats`)
						.setDescription(
							"Mobs Killed: "+data.global.mobsKilled+"\n"+
							"PvP Win/Loss Ratio: "+data.global.pvp.kills+"/"+data.global.pvp.deaths+
							" ("+Math.round((data.global.pvp.kills/data.global.pvp.deaths)*1000)/10+"%)\n"+
							"Chests Found: "+data.global.chestsFound+"\n"+
							"Total Level: "+data.global.totalLevel.combined+"\n"+
							"Total Time Ingame: "+Math.round((data.meta.playtime*5/60)*100)/100+" hours\n"+
							"Guild: "+(data.guild.name?data.guild.name:"none")+" "+(data.guild.rank?"["+data.guild.rank+"]":""))
						.addField("Classes",classes,false);
						if (data.ranking) {
							embed.addField("Ranks","Pvp: "+(data.ranking.pvp?data.ranking.pvp:"none")+"\nPlayer: "+(data.ranking.player.overall.all?data.ranking.player.overall.all:"none")+"\nGuild: "+(data.ranking.guild?data.ranking.guild:"none"),false);
						}
					message.channel.send(embed).catch((err)=>{
						console.log(err);
						message.channel.send("There was an error using this command, verify that your set image is an actual image.");
					});
				} else {
					if (split[1]!=undefined&&split[1]!="") {
						message.channel.send(`Statistics for ${split[1]} couldn't be found. Check spelling and capitalization.`);
					} else {
						message.channel.send("**"+message.author.username+"**"+
						" you haven't named anyone, if you want to set up your default ign, do `/pdefault [player name]`")
					}
				}
			});
		break;
		case "/pdefault":
			if (plData[message.author.id]) {
				plData[message.author.id].ign = split.slice(1).join(" ");
			} else {
				plData[message.author.id] = {ign:split.slice(1).join(" ")};
			}
			message.channel.send(`**${message.author.username}**, you successfully changed your default username to ${split.slice(1).join(" ")}`);
		break;
		case "/pimg":
			if (plData[message.author.id]) {
				plData[message.author.id].img = split.slice(1).join(" ");
			} else {
				plData[message.author.id] = {img:split.slice(1).join(" ")};
			}
			message.channel.send(`**${message.author.username}**, you successfully changed your default picture to ${split.slice(1).join(" ")}`);
		break;
		case "/uptime":
			message.channel.send((client.uptime/1000)+" seconds");
		break;
		case "/restrict":
			if (!botrank) {
				return;
			}
			if (gbData[guild.id].channel.includes(message.channel.id)) {
				gbData[guild.id].channel.splice(gbData[guild.id].channel.indexOf(message.channel.id),1);
				message.channel.send("Success, the channel <#"+message.channel.id+"> has been removed from the list of allowed channels.");
				return;
			}
			gbData[guild.id].channel.push(message.channel.id);
			let chan = gbData[guild.id].channel;
			let strg = "";
			for (var i = 0; i < chan.length-1; i++) {
				strg+="<#"+chan[i]+">, "
			}
			if (strg!="") {
				strg+="and <#"+chan[chan.length-1]+">";
			} else {
				strg+="<#"+chan[0]+">";
			}
			message.channel.send("The bot will now only be allowed to talk in "+strg);
			return;
		break;
		case "/war":
			if (working.length===0) {
				if (current) {
					message.channel.send("There are no proven working worlds. **"+current+"** is the most recent server.");
					return;
				}
				message.channel.send("There are no worlds currently proven to work.");
				return;
			}
			let fin = "";
			if (working.length===1) {
				fin = "**"+working[0]+"** is";
			}
			if (working.length===2) {
				fin = "**"+working[0]+"** or **"+working[1]+"** are";
			}
			if (working.length>2) {
				for (var j = 0; j < working.length-1; j++) {
					fin+="**"+working[j]+"**, ";
				}
				fin+="and **"+working[working.length-1]+"** are";
			}
			message.channel.send(fin+" most likely to work for wars at the moment.");
		break;
		case "/togglefeed":
			if (!botrank) {
				return;
			}
			if (gbData[guild.id].feed) {
				gbData[guild.id].terrchannel = message.channel.id;
				gbData[guild.id].feed = false;
				message.channel.send(`The live guild takeover feed has been stopped.`);
			} else {
				gbData[guild.id].terrchannel = message.channel.id;
				gbData[guild.id].feed = true;
				message.channel.send(`The live guild takeover feed has started in **<#${message.channel.id}>**`)
			}
		break;
		case "/count":
			request({url:"https://api.wynncraft.com/public_api.php?action=onlinePlayersSum",json:true},(err,res,data)=>{
				if (res.statusCode>=500||res.statusCode===404) {
					message.channel.send(errorMsg);
					return;
				}
				if (!err&&res.statusCode===200&&!data.error) {
					message.channel.send("Current # of players online: `"+data.players_online+"`");
				}
			});
		break;
		case "/logonfeed":
			if (!botrank) {
				return;
			}
			if (gbData[guild.id].pfeed) {
				gbData[guild.id].pchannel = message.channel.id;
				gbData[guild.id].pfeed = false;
				message.channel.send(`War server log-ons will no longer be displayed in this channel.`);
			} else {
				gbData[guild.id].pchannel = message.channel.id;
				gbData[guild.id].pfeed = true;
				message.channel.send(`War server log-ons will be shown in **<#${message.channel.id}>**`);
			}
		break;
		case "/plan":
			let content = split.slice(1).join(" ").split(", ");
			let title = content[0];
			let description = content[1];
			let time = moment(content[2])
			let max = content[3];
			plans[message.author.id] = {
				title:title,
				des:description,
				time:time,
				max:max
			}
			message.channel.send(title,description,time,max);
		break;
		case "/leaderboard":
			if (!split[1]) {
				split[1] = 1;
			}
			leader.board(split[1],(mes)=>{
				message.channel.send(mes);
			});
		break;
		case "/banner":
			let thing;
			if (split.length===2&&split[1].length===3) {
				if (prefix.getProp(split[1])) {
					thing = prefix.getProp(split[1]);
				}
			}
			if (thing) {
				thing = thing.replace(/ /g,"%20");
			} else {
				thing = split.slice(1).join("%20");
			}
			message.channel.send(new Discord.Attachment(`https://${/* api website name*/}/banner?g=`+thing,"banner.png"));
		break;
		case "/disable":
		case "/toggle":
			if (!botrank) {
				return;
			}
			if (!gbData[guild.id].disabled) {
				gbData[guild.id].disabled = [];
			}
			if (!split[1]) {
				let comm = gbData[guild.id].disabled;
				let string = "";
				for (var i = 0; i < comm.length-1; i++) {
					string+="**"+comm[i]+"**, "
				}
				if (string!="") {
					string+="and **"+comm[comm.length-1]+"**";
				} else {
					string+="**"+comm[0]+"**";
				}
				message.channel.send(`The disabled commands are ${string}`);
				return;
			}
			if (split[1][0]!="/") {
				split[1]="/"+split[1];
			}
			if (!commands.includes(split[1])) {
				message.channel.send(`${split[1]} isn't a valid command`);
				return;
			}
			if (gbData[guild.id].disabled.includes(split[1])) {
				gbData[guild.id].disabled.splice(gbData[guild.id].disabled.indexOf(split[1]),1);
				message.channel.send("Success, the command **"+split[1]+"** has been removed from the list of banned commands.");
				return;
			}
			gbData[guild.id].disabled.push(split[1]);
			let comm = gbData[guild.id].disabled;
			let string = "";
			for (var i = 0; i < comm.length-1; i++) {
				string+="**"+comm[i]+"**, "
			}
			if (string!="") {
				string+="and **"+comm[comm.length-1]+"**";
			} else {
				string+="**"+comm[0]+"**";
			}
			message.channel.send(`The disabled commands are now ${string}`);
			return;
		break;
	}
});

function getJSON(file, callback) {
	fs.readFile(file, (err,data) => {
		if (err) {
			console.log(err,data);
		}
		callback(JSON.parse(data));
	})
}

setInterval(()=>{
	let fin = "";
	request({url:"https://api.wynncraft.com/public_api.php?action=territoryList",json:true},(err,res,data)=>{
		if (!err&&res.statusCode===200&&data.territories) {
			let thing = data.territories;
			Object.values(thing).forEach((ter)=>{
				if (terrs[ter.territory]) {
					if (ter.guild!=terrs[ter.territory].guild) {
						fin+=`__**${ter.territory}:**__ ~~\`${terrs[ter.territory].guild}\`~~ \\➡ \`${ter.guild}\`\n`;
					}
				}
			});
			if (fin.length>0) {
				client.guilds.forEach(gui=>{
					gui.channels.forEach(chan=>{
						if (chan.id===gbData[gui.id].terrchannel&&gbData[gui.id].feed===true) {
							chan.send(fin).catch(err=>{
								if (err) {
									console.log(err);
								}
							});
						}
					});
				});
			}
			terrs = data.territories;
			war.right(terrs,(text,worlds,cur)=>{
				if (!text&&!worlds&&cur) {
					current = cur;
					return;
				}
				working = worlds;
				current = cur;
				client.guilds.forEach(gui=>{
					gui.channels.forEach(chan=>{
						if (chan.id===gbData[gui.id].pchannel&&gbData[gui.id].pfeed===true) {
							chan.send(text).catch(err=>{
								if (err) {
									console.log(err);
								}
							});
						}
					});
				});
			})
		}
	});
},60000)

setInterval(()=>{
	request({url:`http://${/*api website url*/}/prefix`,json:true},(err,res,dat)=>{
		if (!err&&res.statusCode===200) {
			prefix = dat;
		}
	})
},3600000);

setInterval(function() {
	let data = JSON.stringify(gbData,null,4);
	let data2 = JSON.stringify(plData,null,4);
	let tempservers = 0;
	fs.writeFile("defaults.json",data,(err)=>{
		if (err) {
			console.log(err);
		}
	});
	fs.writeFile("players.json",data2,(err)=>{
		if (err) {
			console.log(err);
		}
	});
	client.guilds.forEach((guilds)=>{
		tempservers++;
		if (gbData[guilds.id]) {
			if (!gbData[guilds.id].rank) {
				gbData[guilds.id].rank = "null"
			}
			if (!gbData[guilds.id].channel) {
				gbData[guilds.id].channel = [];
			}
		} else {
			gbData[guilds.id] = {rank:"null",channel:[]};
		}
	});
	servers = tempservers;
},60000);

function timedRemove(message) {
	setTimeout(function() {
		delete resetTime[message.channel];
	},30000)
}
function block(member,time) {
	let to = client.setTimeout(()=>{
		delete mythicBlock[member];
	},time)
	mythicBlock[member] = to._idleStart;
}
function blockgay(channel,time) {
	let to = client.setTimeout(()=>{
		delete gayBlock[channel];
	},time)
	gayBlock[channel] = to._idleStart;
}

client.on("ready",()=>{
	war.startup();
	let tempservers = 0;
	getJSON("defaults.json",dat=>{
		gbData = dat;
	});
	getJSON("players.json",dat=>{
		plData = dat;
	});
	client.user.setPresence({game:{name:"/help"}});
	setTimeout(function() {
		client.guilds.forEach((guilds)=>{
			if (gbData[guilds.id]) {
				if (!gbData[guilds.id].rank) {
					gbData[guilds.id].rank = "null"
				}
				if (!gbData[guilds.id].channel) {
					gbData[guilds.id].channel = [];
				}
			} else {
				gbData[guilds.id] = {rank:"null",channel:[]};
			}
		});
	},2000);
	request({url:"https://api.wynncraft.com/public_api.php?action=territoryList",json:true},(err,res,data)=>{
		if (res.statusCode>=500||res.statusCode===404) {
			return;
		} else if (res.statusCode===200&&!err&&data) {
			terrs = data.territories;
		}
	});
	servers = tempservers;
	request({url:`http://${/*api website url*/}/prefix`,json:true},(err,res,dat)=>{
		if (!err&&res.statusCode===200) {
			prefix = dat;
		}
	})
	leader.start();
});

client.login(/* login key */);