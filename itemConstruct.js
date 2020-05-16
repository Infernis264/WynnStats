module.exports.construct = constructItem;

const Discord = require("discord.js");
const types = {
	healthRegen: "%",manaRegen: "/4s",spellDamage: "%",damageBonus: "%",lifeSteal: "/4s",manaSteal: "/4s",xpBonus: "%",lootBonus: "%",reflection: "%",
	strengthPoints: "",dexterityPoints: "",intelligencePoints: "",agilityPoints: "",defensePoints: "",thorns: "%",exploding: "%",speed: "%",
	attackSpeedBonus: " tier",poison: "/3s",healthBonus: "",soulPoints: "%",emeraldStealing: "%",healthRegenRaw: "",spellDamageRaw: "",damageBonusRaw: "",
	bonusFireDamage: "%",bonusWaterDamage: "%",bonusAirDamage: "%",bonusThunderDamage: "%",bonusEarthDamage: "%",bonusFireDefense: "%",bonusWaterDefense: "%",
	bonusAirDefense: "%",bonusThunderDefense: "%",bonusEarthDefense: "%"
}
const alias = {
	damageBonus:"Melee Damage",strengthPoints:"Strength",dexterityPoints:"Dexterity",intelligencePoints:"Intelligence",agilityPoints:"Agility",
	defensePoints:"Defense",speed:"Walk Speed",attackSpeedBonus:"Attack Speed",healthBonus:"Health",soulPoints:"Soul Point Regen",emeraldStealing:"Stealing",
	healthRegenRaw:"Health Regen",spellDamageRaw:"Spell Damage",damageBonusRaw:"Melee Damage",bonusFireDamage:"✹ Fire Damage",
	bonusWaterDamage:"❉ Water Damage",bonusAirDamage:"❋ Air Damage",bonusThunderDamage:"✦ Thunder Damage",bonusEarthDamage:"✤ Earth Damage",
	bonusFireDefense:"✹ Fire Defense",bonusWaterDefense:"❉ Water Defense",bonusAirDefense:"❋ Air Defense",bonusThunderDefense:"✦ Thunder Defense",
	bonusEarthDefense: "✤ Earth Defense"
}

function constructItem(item) {
	let keys = Object.keys(item);
	let values = Object.values(item);
	let indexes = [];
	let final = "";
	let embed = new Discord.RichEmbed();
	embed.setTitle(item.name);
	embed.setThumbnail("https://github.com/imgshare/img/blob/master/"+makeVal(item)+".png?raw=true");
	if (item.sockets!=0) {
		embed.setFooter("[0/"+item.sockets+"] Powder Slots");
	}
	if (item.attackSpeed) {
		final+=item.attackSpeed.toLowerCase().capital("_")+" Attack Speed\n\n";
	}
	if (item.health) {
		final+="\\❤ Health: "+item.health+"\n";
	}
	if (item.category==="armor"||item.category==="accessory") {
		if (item.fireDefense) {
			final+="✹ Fire Defense: "+item.fireDefense+"\n";
		}
		if (item.waterDefense!=0) {
			final+="❉ Water Defense: "+item.waterDefense+"\n";
		}
		if (item.airDefense!=0) {
			final+="❋ Air Defense: "+item.airDefense+"\n";
		}
		if (item.thunderDefense!=0) {
			final+="✦ Thunder Defense: "+item.thunderDefense+"\n";
		}
		if (item.earthDefense!=0) {
			final+="✤ Earth Defense: "+item.earthDefense+"\n";
		}
	}
	if (item.category==="weapon") {
		if (item.damage!="0-0") {
			final+="✤ Neutral Damage: "+item.damage+"\n";
		}
		if (item.fireDamage!="0-0") {
			final+="✹ Fire Damage: "+item.fireDamage+"\n";
		}
		if (item.waterDamage!="0-0") {
			final+="❉ Water Damage: "+item.waterDamage+"\n";
		}
		if (item.airDamage!="0-0") {
			final+="❋ Air Damage: "+item.airDamage+"\n";
		}
		if (item.thunderDamage!="0-0") {
			final+="✦ Thunder Damage: "+item.thunderDamage+"\n";
		}
		if (item.earthDamage!="0-0") {
			final+="✤ Earth Damage: "+item.earthDamage+"\n";
		}
	}
	final+="\n";
	if (item.classRequirement) {
		switch (item.classRequirement) {
			case "Archer":
				final+="Class Req: Archer/Hunter\n";
			break;
			case "Assassin":
				final+="Class Req: Assassin/Ninja\n";
			break;
			case "Mage":
				final+="Class Req: Mage/Dark Wizard\n";
			break;
			case "Warrior":
				final+="Class Req: Warrior/Knight\n";
			break;
		}
	}
	switch (item.type) {
		case "Bow":
			final+="Class Req: Archer/Hunter\n";
		break;
		case "Dagger":
			final+="Class Req: Assassin/Ninja\n";
		break;
		case "Wand":
			final+="Class Req: Mage/Dark Wizard\n";
		break;
		case "Spear":
			final+="Class Req: Warrior/Knight\n";
		break;
	}
	final+="Level: "+item.level+"\n";
	if (item.quest) {
		final+="Quest Req: "+item.quest+"\n";
	}
	if (item.strength) {
		final+="Strength Min: "+item.strength+"\n";
	}
	if (item.dexterity) {
		final+="Dexterity Min: "+item.dexterity+"\n";
	}
	if (item.intelligence) {
		final+="Intelligence Min: "+item.intelligence+"\n";
	}
	if (item.defense) {
		final+="Defense Min: "+item.defense+"\n";
	}
	if (item.agility) {
		final+="Agility Min: "+item.agility+"\n";
	}
	final+="\n";
	if (!item.identified) {
		for (var i = keys.indexOf("healthRegen"); i < keys.length-1; i++) {
			if (values[i]!=0) {
				indexes.push(i);
			}
		}
		for (var i = 0; i < indexes.length; i++) {
			if (Math.sign(values[indexes[i]])===-1) {
				if (alias[keys[indexes[i]]]) {
					final+=alias[keys[indexes[i]]]+": -"+Math.round(values[indexes[i]]*-1.3)+types[keys[indexes[i]]]+" to -"+
						Math.round(values[indexes[i]]*-0.7)+types[keys[indexes[i]]]+"\n";
				} else {
					let cor = "";
					let correct = keys[indexes[i]].split(/(?=[A-Z])/g).forEach(str=>{
						cor+=str.capital()+" ";
					});
					final+=cor.slice(0,-1)+": -"+Math.round(values[indexes[i]]*-1.3)+types[keys[indexes[i]]]+" to -"+Math.round(values[indexes[i]]*-0.7)+
						types[keys[indexes[i]]]+"\n";
				}
			} else {
				if (alias[keys[indexes[i]]]) {
					final+=alias[keys[indexes[i]]]+": +"+Math.round(values[indexes[i]]*0.3)+types[keys[indexes[i]]]+" to +"+
						Math.round(values[indexes[i]]*1.3)+types[keys[indexes[i]]]+"\n";
				} else {
					let cor = "";
					let correct = keys[indexes[i]].split(/(?=[A-Z])/g).forEach(str=>{
						cor+=str.capital()+" ";
					});
					final+=cor.slice(0,-1)+": +"+Math.round(values[indexes[i]]*0.3)+types[keys[indexes[i]]]+" to +"+Math.round(values[indexes[i]]*1.3)+
					types[keys[indexes[i]]]+"\n";
				}
			}
		}
	} else {
		for (var i = keys.indexOf("healthRegen"); i < keys.length-1; i++) {
			if (values[i]!=0) {
				indexes.push(i);
			}
		}
		for (var i = 0; i < indexes.length; i++) {
			if (Math.sign(values[indexes[i]])===-1) {
				if (alias[keys[indexes[i]]]) {
					final+=alias[keys[indexes[i]]]+": "+values[indexes[i]]+types[keys[indexes[i]]]+"\n";
				} else {
					let cor = "";
					let correct = keys[indexes[i]].split(/(?=[A-Z])/g).forEach(str=>{
						cor+=str.capital()+" ";
					});
					final+=cor.slice(0,-1)+": "+values[indexes[i]]+types[keys[indexes[i]]]+"\n";
				}
			} else {
				if (alias[keys[indexes[i]]]) {
					final+=alias[keys[indexes[i]]]+": +"+values[indexes[i]]+types[keys[indexes[i]]]+"\n";
				} else {
					let cor = "";
					let correct = keys[indexes[i]].split(/(?=[A-Z])/g).forEach(str=>{
						cor+=str.capital()+" ";
					});
					final+=cor.slice(0,-1)+": +"+values[indexes[i]]+types[keys[indexes[i]]]+"\n";
				}
			}
		}
	}
	if (item.addedLore) {
		let spilt = item.addedLore.split(" ");
		let finesse = "";
		for (let i = 0; i<spilt.length; i++) {
			if (i%5===0) {
				finesse+="\n"+spilt[i]+" ";
			}else {
				finesse+=spilt[i]+" ";
			}
		}
		final+="\n"+finesse;
	}
	switch (item.tier) {
		case "Mythic":
			embed.setColor("#AA00AA");
		break;
		case "Legendary":
			embed.setColor("#55FFFF");
		break;
		case "Rare":
			embed.setColor("#FF55FF");
		break;
		case "Unique":
			embed.setColor("FFFF55");
		break;
		case "Normal":
			embed.setColor("#FFFFFF");
		break;
		case "Set":
			embed.setColor("#00AA00");
		break;
	}
	embed.setDescription(final);
	return embed;
}

function makeVal(item) {
	let num = 0;
	switch (item.armorType) {
		case "Diamond":
			num+=309;
		break;
		case "Iron":
			num+=305;
		break;
		case "Gold":
			num+=313;
		break;
		case "Chain":
			num+=301;
		break;
		case "Leather":
			num+=297;
		break;
	}
	switch (item.type) {
		case "Helmet":
			num+=1;
		break;
		case "Chestplate":
			num+=2;
		break;
		case "Leggings":
			num+=3;
		break;
		case "Boots":
			num+=4;
		break;
	}
	if (num===0) {
		if (item.material) {
			num = item.material.replace(/:0/g,"").replace(/:/g,"-");
		}
	}
	return num;
}