const {getCatalog,byId}=require('./catalog.cjs');
const {summary,fail,validatePlan}=require('./domain.cjs');
const {dateAt,closedOn,visitFits,visitNote}=require('./visit-rules.cjs');
const {round,distance,VERSION}=require('./travel-estimates.cjs');
const {schedule}=require('./day-schedule.cjs');
function permute(list){if(list.length<2)return [list];return list.flatMap((v,i)=>permute(list.filter((_,j)=>j!==i)).map(t=>[v,...t]));}
function combinations(list,n,start=0,current=[],out=[]){if(current.length===n){out.push(current.slice());return out;}for(let i=start;i<=list.length-(n-current.length);i++){current.push(list[i]);combinations(list,n,i+1,current,out);current.pop();}return out;}
function solve(room,order,style){
  const {places,byId:local,city}=getCatalog(room.city);
  const s=summary(room),allMust=new Set(room.members.flatMap(m=>m.preferences.must)),avoid=new Set(room.members.flatMap(m=>m.preferences.avoid));
  const wishes=new Set(room.members.flatMap(m=>m.preferences.wants));
  const available=places.filter(p=>!avoid.has(p.id)&&(!p.exclusiveDay||wishes.has(p.id)));
  const dates=Array.from({length:room.days},(_,i)=>dateAt(room.startDate,i));
  for(const id of allMust){if(dates.every(date=>closedOn(local[id],date)))fail('PLACE_CLOSED',local[id].name+'在这些日期按常规规则闭馆。请调整旅行日期，或取消该必去项；节假日例外需向场馆核实。',422);}
  for(const id of allMust){const p=local[id];if(p.exclusiveDay&&(s.startHour>p.latestStartHour||s.maxWalk<p.dayWalk||s.budget<p.dayBudget))fail('NO_FEASIBLE_PLAN',p.name+'需要单独一天：从市中心建议 '+p.latestStartHour+':00 出发，含接驳步行约 '+p.dayWalk+' 公里，每人至少预留 ¥'+p.dayBudget+'。请共同调整出发时间、步行或预算限制，或取消该必去项；不会自动放宽任何人的限制。',422);}
  if([...allMust].filter(id=>local[id].exclusiveDay).length>room.days)fail('NO_FEASIBLE_PLAN','必去景点中有多个需单独安排一天，请增加天数或减少必去项。',422);
  const bits=Object.fromEntries(places.map((p,i)=>[p.id,1<<i]));
  const mustMask=[...allMust].reduce((m,id)=>m|bits[id],0);
  const ranking=[...new Set(order)].filter(id=>local[id]&&!avoid.has(id));
  const weight=Object.fromEntries(available.map(p=>{
    const preference=room.members.reduce((n,m)=>n+(m.preferences.wants.includes(p.id)?20:0)+p.tags.filter(t=>m.preferences.tags.includes(t)).length*2,0);
    const rank=ranking.indexOf(p.id),aiPriority=rank<0?0:Math.max(2,12-rank);
    return [p.id,4+preference+aiPriority];
  }));
  const maxStops=s.pace==='relaxed'?3:4;
  const candidates=[];
  const subsets=available.filter(p=>p.exclusiveDay).map(p=>[p.id]);
  for(let count=2;count<=maxStops;count++)subsets.push(...combinations(available.filter(p=>!p.exclusiveDay).map(p=>p.id),count));
  for(const subset of subsets){
    const count=subset.length;
    if(subset.reduce((n,id)=>n+byId[id].walk,0)>s.maxWalk)continue;
    let best=null;
    for(const route of permute(subset)){
      const day=schedule(route,s);
      if(day.walk>s.maxWalk||day.endMinute>18*60||day.activityMinutes<120||day.budget>s.budget-(room.days-1)*120||!day.stops.every(stop=>visitFits(local[stop.placeId],stop)))continue;
      const metric=day.transitMinutes*.15+day.crossings*12+day.walk+day.endMinute*.002;
      if(!best||metric<best.metric)best={...day,metric};
    }
    if(!best)continue;
    const score=subset.reduce((n,id)=>n+weight[id],0)-best.travel*(style==='calm'?3.5:1.8)-best.walk*(style==='calm'?2.4:.7)-best.crossings*12-(style==='calm'&&count>2?9:0);
    candidates.push({...best,allowedDates:dates.map(date=>best.stops.every(stop=>visitFits(local[stop.placeId],stop,date))),mask:subset.reduce((m,id)=>m|bits[id],0),score});
  }
  if(!candidates.length)fail('NO_FEASIBLE_PLAN','当前限制下排不出完整的一天。试着减少必去地点，或调整当地活动预算、步行上限。',422);
  let states=[{mask:0,budget:0,score:0,days:[]}];
  for(let day=0;day<room.days;day++){
    const next=new Map();
    const allowed=candidates.filter(c=>c.allowedDates[day]);
    for(const state of states)for(const candidate of allowed){
      if(state.mask&candidate.mask||state.budget+candidate.budget>s.budget)continue;
      if(day===room.days-1&&((state.mask|candidate.mask)&mustMask)!==mustMask)continue;
      const item={mask:state.mask|candidate.mask,budget:state.budget+candidate.budget,score:state.score+candidate.score,days:[...state.days,candidate]};
      const key=item.mask,frontier=next.get(key)||[];
      if(frontier.some(x=>x.budget<=item.budget&&x.score>=item.score))continue;
      const kept=frontier.filter(x=>!(item.budget<=x.budget&&item.score>=x.score));kept.push(item);next.set(key,kept);
    }
    states=[...next.values()].flat();
  }
  const feasible=states.filter(x=>(x.mask&mustMask)===mustMask).sort((a,b)=>b.score-a.score||a.budget-b.budget);
  if(!feasible.length)fail('NO_FEASIBLE_PLAN','这些条件暂时无法排成完整的 '+room.days+' 天。减少必去地点，或共同调整出发时间、预算、步行上限与游玩节奏后再试。',422);
  const chosen=feasible[0];
  const dayList=chosen.days.map((d,i)=>{const {mask,metric,score,travel,allowedDates,...day}=d;return {...day,day:i+1};});
  const included=[...new Set(dayList.flatMap(d=>d.stops.map(s=>s.placeId)))],omitted=[...wishes].filter(id=>!included.includes(id));
  const omissionReasons=Object.fromEntries(omitted.map(id=>[id,avoid.has(id)?'有旅伴本次不去':dates.every(date=>closedOn(local[id],date))?'这些日期按常规规则闭馆':local[id].exclusiveDay?'需要单独一天，并满足预算、步行和出发时间限制':'在当前天数和共同限制下，优先安排了其他地点']));
  const visitNotes=included.map(id=>({placeId:id,text:visitNote(local[id]),source:local[id].source})).filter(n=>n.text);
  const hasFullDay=included.some(id=>local[id].exclusiveDay);
  const minStops=Math.min(...dayList.map(d=>d.stops.length)),maxCount=Math.max(...dayList.map(d=>d.stops.length));
  return {estimationVersion:VERSION,title:hasFullDay?(style==='calm'?'留足时间，慢慢玩':'多些不同体验'):style==='calm'?(city==='上海'?'沿江慢慢逛':'湖边慢一点'):'多看一点'+city,subtitle:hasFullDay?'给整日景点留足游览和往返时间':style==='calm'?'把相近的地方放在一起，留点空白':'在舒服的范围里，多一些不同体验',style,days:dayList,budget:chosen.budget,walk:round(dayList.reduce((n,d)=>n+d.walk,0)),included,omitted,omissionReasons,visitNotes,reason:`每天 ${minStops===maxCount?minStops:minStops+'—'+maxCount} 个去处，${s.startHour}:00 后出门，午间留出休息。${omitted.length?'有 '+omitted.length+' 个想去的地方暂未纳入，可以继续商量。':'已选的想去地点都已纳入。'}`,estimateNote:'按市中心住处出发预留首末接驳。距离为坐标直线距离，时间含步行、候车换乘和入场缓冲，不是导航；交通按公交/地铁预留，不含出租车。预算分为门票、餐饮、市内交通和机动金，不含住宿、购物及往返'+city+'交通；门票、营业与预约需出行前核实。'+(city==='上海'?'外观、入园和常设展以各地点说明为准；迪士尼与天文馆单独安排一天，所留交通时间不等同于导航。方案不代表门票或预约已确认。':'')};
}
function prerequisites(room){const s=summary(room);if(s.missing.length)fail('PREFERENCES_MISSING','等每个人提交想法后再生成。',409);if(s.conflicts.length)fail('PREFERENCE_CONFLICT',s.conflicts[0].detail,422);return s;}
function diversify(room,a,b){
  const signature=p=>p.days.map(d=>d.stops.map(s=>s.placeId).join(',')).join('|');
  if(signature(a)!==signature(b))return [a,b];
  const s=summary(room),reversed=b.days.map(d=>schedule(d.stops.map(s=>s.placeId).reverse(),s));
  if(reversed.every((d,i)=>d.endMinute<=18*60&&d.walk<=s.maxWalk&&d.transitMinutes<=b.days[i].transitMinutes+15&&d.crossings<=b.days[i].crossings&&d.stops.every(stop=>visitFits(byId[stop.placeId],stop,dateAt(room.startDate,i))))&&reversed.reduce((n,d)=>n+d.budget,0)<=s.budget&&reversed.some((d,i)=>d.stops.some((stop,j)=>stop.placeId!==b.days[i].stops[j].placeId))){
    b={...b,title:'换个顺序慢慢走',subtitle:'地点一样，换一个先后顺序',reason:'这组限制下，两份安排选择了相同地点。可以比较先后顺序，选大家更顺手的一份。',days:reversed.map((d,i)=>{const {travel,...rest}=d;return {...rest,day:i+1};}),walk:round(reversed.reduce((n,d)=>n+d.walk,0)),budget:reversed.reduce((n,d)=>n+d.budget,0)};
  }
  if(signature(a)===signature(b))b={...b,title:'当前可行的同一安排',subtitle:'当前条件下，两种策略得出了相同路线',reason:'没有找到第二条不同且满足限制的路线。可接受这份安排，或调整日期、必去项与节奏后重新生成。'};
  return [a,b];
}
function generateRules(room){
  const {places}=getCatalog(room.city);
  prerequisites(room);const scores=Object.fromEntries(places.map(p=>[p.id,room.members.reduce((n,m)=>n+(m.preferences.wants.includes(p.id)?10:0)+p.tags.filter(t=>m.preferences.tags.includes(t)).length,0)]));
  const preferred=places.slice().sort((a,b)=>scores[b.id]-scores[a.id]);
  return diversify(room,solve(room,preferred.filter(p=>p.area!=='运河').map(p=>p.id),'calm'),solve(room,preferred.map(p=>p.id),'explore'));
}
function materializeAI(room,data){
  const local=getCatalog(room.city).byId;
  prerequisites(room);
  if(!Array.isArray(data?.plans)||data.plans.length!==2)fail('AI_INVALID','AI 没有返回两份完整方案，请重试。',502);
  const plans=data.plans.map((p,i)=>{
    if(!Array.isArray(p.placeIds)||p.placeIds.some(id=>!local[id]))fail('AI_INVALID','AI 推荐了尚未核对的地点，已停止生成。',502);
    const result=solve(room,p.placeIds,i===0?'calm':'explore');
    const title=String(p.title||'').trim();if(title&&title.length<=16&&!/[<>={}\\]|walk|km/i.test(title))result.title=title;
    const errors=validatePlan(room,result);if(errors.length)fail('PLAN_CONSTRAINT',errors.join('；'),422);
    return result;
  });
  return diversify(room,plans[0],plans[1]);
}
module.exports={generateRules,materializeAI,distance,build:solve,schedule};
