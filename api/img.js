module.exports.makeBanner = parseData;
var noBanner;
module.exports.noBanner = noBanner;

const jimp = require("jimp");

jimp.read("banners/no.png",(err,data)=>{
	data.getBuffer("image/png",(errr,dat)=>{
		noBanner = dat;
		module.exports.noBanner = dat;
	})
})

function parseData(data,cb) {
	jimp.read("banners/base_"+data.base.toLowerCase()+".png",(err,idata)=>{
		for (var i = 0; i < data.layers.length; i++) {
			if (data.layers[i].pattern==="CIRCLE_MIDDLE") {
				data.layers[i].pattern="circle";
			}
			jimp.read("banners/"+data.layers[i].pattern.toLowerCase()+"_"+data.layers[i].colour.toLowerCase()+".png",(err,data2)=>{
				data.layers.splice(0,1);
				idata.composite(data2,0,0);
				if (data.layers.length===0) {
					idata.getBuffer("image/png",(err,image)=>{
						cb(image);
					})
				}
			});
		}
	});
}