module.exports.formatDate = formatDate;

const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(date) {
	let string = "";
	string+=days[date.getDay()]+" ";
	string+=months[date.getMonth()]+" ";
	switch (date.getDate()) {
		case 1:
		case 21:
		case 31:
			string+=date.getDate()+"st, ";
		break;
		case 2:
		case 22:
			string+=date.getDate()+"nd, ";
		break;
		case 3:
		case 23:
			string+=date.getDate()+"rd, ";
		break;
		default:
			string+=date.getDate()+"th, ";
		break;
	}
	string+=date.getFullYear()+" at ";
	var m = date.getMinutes();
	if (m<10) {
		m = "0"+m;
	}
	var h = date.getHours();
	switch(true) {
		case h===0:
			string+="12:"+m+" AM";
		break;
		case (h>0&&h<12):
			string+=h+":"+m+" AM";
		break;
		case h===12:
			string+=h+":"+m+" PM";
		break;
		case (h>12&&h<24):
			string+=(h-12)+":"+m+" PM";
		break;
	}
	return string;
}