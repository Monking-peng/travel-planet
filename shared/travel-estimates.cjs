// Planning reserves, not road-network distances, live navigation or quoted fares.
const round=n=>Math.round(n*10)/10,ceil5=n=>Math.ceil(n/5)*5;
const VERSION=2,MEALS=100,DAY_END=1080;
const centers={上海:{name:'人民广场周边',lat:31.230,lng:121.473,riverBank:'west'},杭州:{name:'湖滨市区',lat:30.252,lng:120.163}};
function distance(a,b){const rad=Math.PI/180,x=(b.lat-a.lat)*rad,y=(b.lng-a.lng)*rad;const h=Math.sin(x/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(y/2)**2;return 6371*2*Math.asin(Math.min(1,Math.sqrt(h)));}
function transfer(a,b,walkingBudget=Infinity){
 const d=distance(a,b),crossing=Boolean(a.riverBank&&b.riverBank&&a.riverBank!==b.riverBank),island=a.id==='santan'||b.id==='santan';
 const walking=round(Math.max(.2,d*1.4));
 if(!crossing&&!island&&d<=1.5&&walking<=walkingBudget)
  return {mode:'附近步行',minutes:ceil5(Math.max(8,walking*20)),cost:0,walk:walking,distanceKm:round(d),crossing:false};
 // A lake island requires a boat, irrespective of its short straight-line distance.
 if(island)return {mode:'码头接驳与乘船',minutes:ceil5(35+d*5),cost:0,walk:.6,distanceKm:round(d),crossing:false,note:'船票已在三潭印月门票预留中；班次、码头和票种需另核'};
 const road=d*1.45+(crossing?2:0);
 return {mode:crossing?'公共交通过江':'公交或地铁',minutes:ceil5(Math.max(crossing?45:30,25+road*3.2)),cost:Math.max(6,Math.ceil(road/10)*2+4),walk:crossing?1.2:.8,distanceKm:round(d),crossing,note:'含进出站、候车及换乘预留；不按出租车计费'};
}
function access(place,city){
 const center=centers[city]||centers.杭州,d=distance(center,place);
 if(place.id==='santan')return {mode:'住处至码头接驳与乘船',minutes:70,cost:6,walk:1,distanceKm:round(d),crossing:false,note:'包含码头候船，船票已在三潭印月门票预留中；实际班次和码头需另核'};
 if(place.exclusiveDay)return {mode:'公共交通接驳',minutes:place.accessMinutes,cost:place.accessCost/2,walk:place.accessWalk??.8,distanceKm:round(d)};
 const crossing=Boolean(center.riverBank&&place.riverBank&&center.riverBank!==place.riverBank);
 return {mode:crossing?'住处接驳（公共交通过江）':'住处接驳预留',minutes:ceil5(Math.max(crossing?45:30,25+d*3)),cost:Math.max(6,Math.ceil(d/10)*2+4),walk:crossing?.6:.4,distanceKm:round(d),crossing};
}
function costs(places,transport){
 const tickets=places.reduce((n,p)=>n+p.cost,0),meals=Math.max(MEALS,...places.map(p=>p.mealBudget||MEALS));
 const contingency=Math.max(20,Math.ceil((tickets+meals+transport)*.1/10)*10);
 return {tickets,meals,transport,contingency,total:tickets+meals+transport+contingency};
}
module.exports={VERSION,MEALS,DAY_END,centers,distance,transfer,access,costs,round};
