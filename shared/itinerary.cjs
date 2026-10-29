const {byId}=require('./catalog.cjs');

function dateAt(startDate,offset){const d=new Date(startDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
function startOf(event){if(Number.isFinite(event.startMinute))return event.startMinute;const match=/^(\d{1,2}):(\d{2})$/.exec(event.time||'');return match?Number(match[1])*60+Number(match[2]):Infinity;}
function formatFinalItinerary(room){
  const plan=room.final.proposal,end=dateAt(room.startDate,room.days-1);
  const lines=[room.title+' · 已定稿',room.startDate+(end!==room.startDate?' — '+end:''),plan.title];
  if(room.final.acceptanceVerified===false)lines.push('历史确认待复核：部分反馈未明确接受，请由发起人重新开启讨论。');
  if(plan.estimationVersion!==2)lines.push('旧估算行程：原记录保留，交通与预算规则已更新，请重新讨论生成并确认。');
  if(Number.isFinite(plan.budget))lines.push('每人当地活动费用约 ¥'+plan.budget+'（规划估算）');
  for(const day of plan.days){
    lines.push('',dateAt(room.startDate,day.day-1)+' · 第 '+day.day+' 天');
    if(day.originAssumption)lines.push('按'+day.originAssumption+'的住处出发并返回；交通共预留 '+day.transitMinutes+' 分钟，实际接驳需核实。');
    if(day.costBreakdown){const c=day.costBreakdown;lines.push('当天每人 ¥'+c.total+' = 门票 '+c.tickets+' + 餐饮 '+c.meals+' + 公共交通 '+c.transport+' + 机动金 '+c.contingency);}
    const events=[...day.stops.map(stop=>({...stop,kind:'place'})),...(day.breaks||[]).map(rest=>({...rest,kind:'rest'}))].sort((a,b)=>startOf(a)-startOf(b));
    for(const event of events){
      const title=event.kind==='place'?byId[event.placeId]?.name||'待确认地点':event.title;
      const travel=event.kind==='rest'&&event.transit?`；${event.transit.mode}，直线约 ${event.transit.distanceKm} km，接驳步行 ${event.transit.walk} km，费用预留 ¥${event.transit.cost}`:event.kind==='place'&&event.transit?'；从上一站'+event.transit.mode+'约 '+event.transit.minutes+' 分钟':'';
      lines.push((event.time||'时间待定')+' '+title+'（约 '+event.minutes+' 分钟'+(event.includesLunch?'，含午休':'')+'）'+travel);
    }
    if(Number.isFinite(day.walk))lines.push('当天步行约 '+day.walk+' 公里');
    if(day.endTime)lines.push('约 '+day.endTime+(day.originAssumption?' 返回'+day.originAssumption:' 结束安排')+'，之后自由活动。');
  }
  if(plan.visitNotes?.length){lines.push('', '出发前核验（尚未代订或确认预约）');for(const note of plan.visitNotes)lines.push((byId[note.placeId]?.name||'景点')+'：'+note.text+' '+note.source);}
  if(plan.estimateNote)lines.push('',plan.estimateNote);
  return lines.join('\n');
}
module.exports={formatFinalItinerary};
