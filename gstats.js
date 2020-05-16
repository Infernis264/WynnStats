module.exports.gstats = gstats;
const Discord = require("discord.js");
const request = require("request");
const find = require("./findPlayer.js");

var errorMsg = "The Wynncraft API is not giving a valid response at the moment. Try to use this command later";

String.prototype.escape = function () {
	return this.replace(/_/g,"\\_");
}

function gstats(prefix,gbData,tempstore,message,plData,terrs) {
	let split = message.content.split(" ");
	let string = split.slice(1).join(" ");
	let guild = message.guild;
	if (split[1]!=undefined) {
		if (split.length===2&&split[1].length===3) {
			if (prefix.getProp(split[1])) {
				string = prefix.getProp(split[1]);
			}
		}
		if (!string) {
			message.channel.send("Please specify a guild!");
			return
		}
		request({url:`https://api.wynncraft.com/public_api.php?action=guildStats&command=${string}`,json:true},(err,response,data)=>{
			if (response.statusCode>=500||response.statusCode===404) {
				message.channel.send(errorMsg);
				return;
			}
			if (!data) {
				message.channel.send(errorMsg);
			}
			if (!err&&response.statusCode===200&&!data.error) {
				tempstore[guild.id] = {
					name:data.name,
					prefix:data.prefix
				};
				if (gbData[guild.id].default===split[1]&&gbData[guild.id].img) {
					let mem = data.members.length;
					let count = 0;
					Object.values(terrs).forEach((ter)=>{
						if (ter.guild===string) {
							count++;
						}
					});
					let own = "";
					let onMem = [];
					let finalMem = ""
					data.members.forEach(memb=>{
						if (memb.rank==="OWNER") {
							own = memb.name;
						}
						if (find.currentPlayers.includes(memb.name)) {
							onMem.push(memb.name);
						}
						let finesse = "";
						for (let i = 0; i<onMem.length; i++) {
							if (i%3===0) {
								finesse+="\n"+onMem[i]+`${i===onMem.length-1?"":","} `;
							}else {
								finesse+=onMem[i]+`${i===onMem.length-1?"":","} `;
							}
						}
						if (finesse) {
							finalMem = finesse;
						} else {
							finalMem = "None";
						}
					});
					let embed = new Discord.RichEmbed()
						.setThumbnail(`https://${/* api website name*/}/banner?g=`+string.replace(/ /g, "%20"))
						.setTitle(`${string} Guild`)
						.setDescription("Prefix: "+data.prefix+"\n"+
							"Level: "+data.level+"\n"+
							"Current XP: "+data.xp+"%\n"+
							"Members: "+mem+"\n"+
							"Owner: "+own.escape()+"\n"+
							"Territories Owned: "+count+"\n"+
							"Creation Date: "+data.createdFriendly+"\n\n"+
							"Online Members: "+finalMem.escape());
					message.channel.send(embed).catch((err)=>{
						message.channel.send("There was an error using this command, verify that the default image is an actual image.");
					});
				} else {
					let count = 0;
					Object.values(terrs).forEach((ter)=>{
						if (ter.guild===string) {
							count++;
						}
					});
					let own = "";
					let onMem = [];
					let finalMem = ""
					data.members.forEach(memb=>{
						if (memb.rank==="OWNER") {
							own = memb.name;
						}
						if (find.currentPlayers.includes(memb.name)) {
							onMem.push(memb.name);
						}
						let finesse = "";
						for (let i = 0; i<onMem.length; i++) {
							if (i%3===0) {
								finesse+="\n"+onMem[i]+`${i===onMem.length-1?"":","} `;;
							}else {
								finesse+=onMem[i]+`${i===onMem.length-1?"":","} `
							}
						}
						if (finesse) {
							finalMem = finesse;
						} else {
							finalMem = "None";
						}
					});
					let mem = data.members.length;
					let embed = new Discord.RichEmbed()
						.setThumbnail(`https://${/* api website name*/}/banner?g=`+string.replace(/ /g, "%20"))
						.setTitle(`${string} Guild`)
						.setDescription("Prefix: "+data.prefix+"\n"+
							"Level: "+data.level+"\n"+
							"Current XP: "+data.xp+"%\n"+
							"Members: "+mem+"\n"+
							"Owner: "+own.escape()+"\n"+
							"Territories Owned: "+count+"\n"+
							"Creation Date: "+data.createdFriendly+"\n\n"+
							"Online Members: "+finalMem.escape());
					message.channel.send(embed);
					return;
				}
			} else {
				message.channel.send(`The guild ${string} doesn't exist or has capitalization/spelling issues.`);
				return;
			}
		})
	} else {
		if (plData[message.author.id]) {
			if (plData[message.author.id].guild) {
				let url2 = "https://api.wynncraft.com/public_api.php?action=guildStats&command="+plData[message.author.id].guild;
				request({url:url2,json:true},(err,response,data2)=>{
					if (response.statusCode>=500||response.statusCode===404) {
						message.channel.send(errorMsg);
						return;
					}
					if (!err&&response.statusCode===200&&!data2.error) {
						let count = 0;
						Object.values(terrs).forEach((ter)=>{
							if (ter.guild===string) {
								count++;
							}
						});
						let own = "";
						let onMem = [];
						let finalMem = ""
						data2.members.forEach(memb=>{
							if (memb.rank==="OWNER") {
								own = memb.name;
							}
							if (find.currentPlayers.includes(memb.name)) {
								onMem.push(memb.name);
							}
							let finesse = "";
							for (let i = 0; i<onMem.length; i++) {
								if (i%3===0) {
									finesse+="\n"+onMem[i]+`${i===onMem.length-1?"":","} `;;
								}else {
									finesse+=onMem[i]+`${i===onMem.length-1?"":","} `
								}
							}
							if (finesse) {
								finalMem = finesse;
							} else {
								finalMem = "None";
							}
						});
						let mem = data2.members.length;
						let embed = new Discord.RichEmbed()
							.setThumbnail(`https://${/* api website name*/}/banner?g=`+plData[message.author.id].guild.replace(/ /g, "%20"))
							.setTitle(`${plData[message.author.id].guild} Guild`)
							.setDescription("Prefix: "+data2.prefix+"\n"+
								"Level: "+data2.level+"\n"+
								"Current XP: "+data2.xp+"%\n"+
								"Members: "+mem+"\n"+
								"Owner: "+own.escape()+"\n"+
								"Territories Owned: "+count+"\n"+
								"Creation Date: "+data2.createdFriendly+"\n\n"+
								"Online Members: "+finalMem.escape());
						message.channel.send(embed).catch((err)=>{
							message.channel.send("There was an error using this command, verify that the default image is an actual image.");
						});
						return;
					} else {
						message.channel.send(`The guild ${data2[guild.id].default} doesn't exist or has capitalization/spelling errors.`);
						return;
					}
				});
			}
		} else {
			if (gbData[guild.id]) {
				if (gbData[guild.id].default) {
					let url2 = "https://api.wynncraft.com/public_api.php?action=guildStats&command="+gbData[guild.id].default;
					request({url:url2,json:true},(err,response,data2)=>{
						if (response.statusCode>=500||response.statusCode===404) {
							message.channel.send("The Wynncraft API is timing out at the moment."+
								" This usually means that the Public API is down. Try again later.");
						}
						if (!err&&response.statusCode===200&&!data2.error) {
							let count = 0;
							Object.values(terrs).forEach((ter)=>{
								if (ter.guild===string) {
									count++;
								}
							});
							let own = "";
							let onMem = [];
							let finalMem = ""
							data.members.forEach(memb=>{
								if (memb.rank==="OWNER") {
									own = memb.name;
								}
								if (find.currentPlayers.includes(memb.name)) {
									onMem.push(memb.name);
								}
								let finesse = "";
								for (let i = 0; i<onMem.length; i++) {
									if (i%3===0) {
										finesse+="\n"+onMem[i]+`${i===onMem.length-1?"":","} `;
									}else {
										finesse+=onMem[i]+`${i===onMem.length-1?"":","} `;
									}
								}
								if (finesse) {
									finalMem = finesse;
								} else {
									finalMem = "None";
								}
							});
							let mem = data2.members.length;
							let embed = new Discord.RichEmbed()
								.setThumbnail(`https://${/* api website name*/}/banner?g=`+gbData[guild.id].default.replace(/ /g, "%20"))
								.setTitle(`${gbData[guild.id].default} Guild`)
								.setDescription("Prefix: "+data2.prefix+"\n"+
									"Level: "+data2.level+"\n"+
									"Current XP: "+data2.xp+"%\n"+
									"Members: "+mem+"\n"+
									"Owner: "+own.escape()+"\n"+
									"Territories Owned: "+count+"\n"+
									"Creation Date: "+data2.createdFriendly+"\n\n"+
									"Online Members: "+finalMem.escape());
							message.channel.send(embed).catch((err)=>{
								message.channel.send("There was an error using this command, verify that the default image is an actual image.");
							});
							return;
						} else {
							message.channel.send(`The guild ${data2[guild.id].default} doesn't exist or has capitalization/spelling errors.`);
							return;
						}
					});
				}
			} else {
				message.channel.send("There is no default guild set for this server or you"+
					" do `/gdefault [guild prefix or name]` to set your default guild or `/defaultguild [guild prefix or name]`");
				return;
			}
		}
	}
}