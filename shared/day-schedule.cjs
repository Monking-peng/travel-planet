const {byId}=require('./catalog.cjs');
const {DAY_END,centers,transfer,access,costs,round}=require('./travel-estimates.cjs');
const hhmm=n=>`${Math.floor(n/60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`;
function schedule(route,limits){
 const places=route.map(id=>byId[id]);if(!places.length||places.some(p=>!p)||places.some(p=>p.exclusiveDay)&&places.length!==1)return {endMinute:Infinity,walk:Infinity};
 const city=route[0].startsWith('sh-')?'上海':'杭州',center=centers[city];
 let time=limits.startHour*60,walk=0,transport=0,travel=0,transitMinutes=0,crossings=0,lunch=false;
 const stops=[],breaks=[],outbound=access(places[0],city),inbound=access(places.at(-1),city);
 let walkingBudget=(limits.maxWalk??Infinity)-places.reduce((n,p)=>n+p.walk,0)-outbound.walk-inbound.walk;
 function pause(minutes,title,kind,extra={}){if(minutes<=0)return;breaks.push({time:hhmm(time),startMinute:time,minutes,title,...(kind?{kind}:{}),...extra});time+=minutes;}
 function journey(t,title,leg){pause(t.minutes,title,'transport',{leg,transit:t});walk+=t.walk;transport+=t.cost;travel+=t.distanceKm;transitMinutes+=t.minutes;if(t.crossing)crossings++;}
 function meal(){if(lunch)return;if(time<690)pause(690-time,'用餐前自由休息','wait');pause(60,'午餐与休息');lunch=true;}
 journey(outbound,'从'+center.name+'出发（住处接驳预留）','outbound');
 for(let i=0;i<places.length;i++){
  const p=places[i],t=i?transfer(places[i-1],p,walkingBudget):null;
  if(t){journey(t,'前往'+p.name,'between');walkingBudget-=t.walk;}
  if(time<(p.openMinute||0))pause(p.openMinute-time,'等候开放','wait');
  const queue=p.entryMinutes||(p.reservation?15:0);
  if(!p.exclusiveDay&&!lunch&&(time>=720||time+queue+p.minutes>810))meal();
  pause(queue,'入场与安检预留','entry');
  const begin=time,duration=p.minutes+(p.exclusiveDay?60:0);
  stops.push({placeId:p.id,time:hhmm(begin),startMinute:begin,endMinute:begin+duration,minutes:duration,...(p.exclusiveDay?{includesLunch:true}:{}),transit:t});
  if(p.exclusiveDay){const mealTime=Math.max(begin,720);breaks.push({time:hhmm(mealTime),startMinute:mealTime,minutes:60,title:'景区内用餐与休息（已含在游览时段）',withinPlaceId:p.id});lunch=true;}
  time+=duration;walk+=p.walk;
  if(!p.exclusiveDay&&!lunch&&time>=720)meal();
 }
 if(!lunch)meal();
 journey(inbound,'返回'+center.name+'（住处接驳预留）','inbound');
 const breakdown=costs(places,transport);
 return {startHour:limits.startHour,stops,breaks,walk:round(walk),budget:breakdown.total,costBreakdown:breakdown,endMinute:time,endTime:hhmm(time),activityMinutes:places.reduce((n,p)=>n+p.minutes,0),travel:round(travel),transitMinutes,crossings,originAssumption:center.name};
}
module.exports={schedule,hhmm};
