const {randomUUID,randomBytes}=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');
const {byId,getCatalog,palette}=require('./catalog.cjs');
const {formatFinalItinerary}=require('./itinerary.cjs');
const {dateAt,visitFits}=require('./visit-rules.cjs');
const {schedule}=require('./day-schedule.cjs');
const {VERSION}=require('./travel-estimates.cjs');
class AppError extends Error {constructor(code,message,status=400){super(message);this.code=code;this.status=status;}}
const fail=(code,message,status)=>{throw new AppError(code,message,status);};
const text=(v,max=120)=>String(v??'').trim().slice(0,max);
const ids=v=>[...new Set(Array.isArray(v)?v:[])].filter(id=>byId[id]);
function member(room,uid){return room.members.find(m=>m.id===uid)||fail('NOT_MEMBER','只有旅行成员可以查看和操作。',403);}
function host(room,uid){member(room,uid);if(room.hostId!==uid)fail('HOST_ONLY','这一步需要由发起人完成。',403);}
function open(room){if(room.closed)fail('CLOSED','这次旅行已关闭。',409);}
function editable(room){open(room);if(room.final)fail('FINAL_LOCKED','这份行程已经定稿，先开启新一轮讨论。',409);}
function makeMember(uid,nickname,index){return {id:uid,nickname:text(nickname,16)||'旅伴',color:palette[index%palette.length],joinedAt:new Date().toISOString(),preferences:null};}
function roomCatalog(city){return getCatalog(city)||fail('CITY_UNSUPPORTED','目前支持杭州和上海，请选择对应城市。');}
function create(uid,input){
  const {city}=roomCatalog(input.city);
  const startDate=text(input.startDate,10),days=Number(input.days||2);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||Number.isNaN(Date.parse(startDate+'T12:00:00Z'))||new Date(startDate+'T12:00:00Z').toISOString().slice(0,10)!==startDate)fail('DATE_INVALID','请选择有效的出发日期。');
  if(!Number.isInteger(days)||days<1||days>3)fail('DAYS_INVALID','第一版支持 1—3 天的旅行。');
  const now=new Date().toISOString();
  return {id:randomUUID(),title:text(input.title,32)||'一起去'+city,city,startDate,days,stay:text(input.stay,100),createdAt:now,updatedAt:now,hostId:uid,members:[makeMember(uid,input.nickname,0)],inviteToken:randomBytes(18).toString('base64url'),revision:1,inputRevision:1,planVersion:0,proposals:[],votes:{},comments:[],history:[],final:null,closed:false};
}
function bump(room,input=false){room.revision++;room.updatedAt=new Date().toISOString();if(input){room.inputRevision++;room.votes={};}}
function preferences(input,city){
  const {tags,byId:local}=roomCatalog(city);
  if(['must','avoid','wants'].some(k=>Array.isArray(input[k])&&input[k].some(id=>byId[id]&&!local[id])))fail('PLACE_CITY_MISMATCH','地点不属于这次旅行的城市，请刷新后重新选择。');
  const budget=Number(input.budget),maxWalk=Number(input.maxWalk),startHour=Number(input.startHour??9);
  if(!Number.isFinite(budget)||budget<50||budget>10000)fail('BUDGET_INVALID','当地活动预算请填 50—10000 元，不含住宿和往返目的地的交通。');
  if(![3,5,8,12].includes(maxWalk))fail('WALK_INVALID','请选择每天可接受的步行量。');
  if(![8,9,10,11].includes(startHour))fail('HOUR_INVALID','请选择每天最早出门时间。');
  const must=ids(input.must),avoid=ids(input.avoid),wants=ids(input.wants);
  if(must.some(id=>avoid.includes(id)))fail('CONFLICT_SELF','同一地点不能同时设为必去和不去。');
  return {text:text(input.text,1000),tags:[...new Set(Array.isArray(input.tags)?input.tags:[])].filter(t=>tags.includes(t)).slice(0,8),budget:Math.round(budget),maxWalk,startHour,pace:['relaxed','balanced','full'].includes(input.pace)?input.pace:'relaxed',wants:[...new Set([...wants,...must])],must,avoid,diet:text(input.diet,120),submittedAt:new Date().toISOString()};
}
function summary(room){
  const submitted=room.members.filter(m=>m.preferences),missing=room.members.filter(m=>!m.preferences).map(m=>({id:m.id,nickname:m.nickname}));
  const conflicts=[],wantMap={};
  for(const m of submitted) for(const id of m.preferences.wants){(wantMap[id]??=[]).push({id:m.id,nickname:m.nickname});}
  for(const id of Object.keys(wantMap)){
    const necessary=submitted.filter(m=>m.preferences.must.includes(id)),against=submitted.filter(m=>m.preferences.avoid.includes(id));
    if(necessary.length&&against.length)conflicts.push({code:'PLACE_CONFLICT',placeId:id,title:`「${byId[id].name}」还需要商量`,detail:`${necessary.map(m=>m.nickname).join('、')}设为必去；${against.map(m=>m.nickname).join('、')}设为不去。先商量，再由本人调整限制。`});
  }
  const votes={};for(const m of submitted)for(const t of m.preferences.tags)votes[t]=(votes[t]||0)+1;
  return {submitted:submitted.length,missing,conflicts,budget:submitted.length?Math.min(...submitted.map(m=>m.preferences.budget)):null,maxWalk:submitted.length?Math.min(...submitted.map(m=>m.preferences.maxWalk)):null,startHour:submitted.length?Math.max(...submitted.map(m=>m.preferences.startHour)):9,pace:submitted.some(m=>m.preferences.pace==='relaxed')?'relaxed':submitted.some(m=>m.preferences.pace==='balanced')?'balanced':'full',commonTags:Object.entries(votes).sort((a,b)=>b[1]-a[1]).map(([tag,count])=>({tag,count})),wishes:Object.entries(wantMap).map(([placeId,people])=>({placeId,people}))};
}
function validatePlan(room,plan){
  const s=summary(room),errors=[],local=roomCatalog(room.city).byId;
  if(Array.isArray(plan.included)&&plan.included.some(id=>!local[id]))errors.push('包含其他城市或未核对的地点');
  if(!Array.isArray(plan.days)||plan.days.length!==room.days)return ['行程天数不匹配'];
  if(plan.estimationVersion!==VERSION)errors.push('交通和预算规则已更新，请重新生成方案后确认');
  const seen=new Set();
  for(const [index,d] of plan.days.entries()){
    if(d.day!==index+1)errors.push('行程日期顺序不匹配');
    if(!Array.isArray(d.stops)||!d.stops.length)errors.push('有一天尚未安排活动');
    for(const stop of d.stops||[]){
      const place=local[stop.placeId];if(!place)errors.push('存在未核对的地点');
      if(seen.has(stop.placeId))errors.push('地点重复');seen.add(stop.placeId);
      if(place){
        if(!visitFits(place,stop,dateAt(room.startDate,index)))errors.push(place.name+'不在常规开放日期或时段内');
        if(stop.endMinute-stop.startMinute<place.minutes+(place.exclusiveDay?60:0))errors.push('景点停留时间不足');
        if(place.exclusiveDay&&(d.stops.length!==1||!stop.includesLunch))errors.push(place.name+'需要单独安排一天并预留午休');
        if(place.exclusiveDay&&(stop.startMinute<d.startHour*60+place.accessMinutes||d.endMinute<stop.endMinute+place.accessMinutes))errors.push('远距离景点往返时间不足');
      }
    }
    // Recompute from authoritative places and group limits, not client totals.
    if(Array.isArray(d.stops)&&d.stops.length&&d.stops.every(stop=>local[stop.placeId])){
      const expected=schedule(d.stops.map(stop=>stop.placeId),s);
      if(Number.isFinite(expected.endMinute)){
        if(!isDeepStrictEqual(d.stops,expected.stops)||!isDeepStrictEqual(d.breaks,expected.breaks))errors.push('交通、入场或游玩时段与重新核算不符，请重新生成');
        if(d.budget!==expected.budget||!isDeepStrictEqual(d.costBreakdown,expected.costBreakdown))errors.push('费用明细遗漏或与重新核算不符');
        if(Math.abs(d.walk-expected.walk)>.01||d.endMinute!==expected.endMinute||d.endTime!==expected.endTime)errors.push('步行或返回时间与重新核算不符');
        if(['startHour','transitMinutes','originAssumption','crossings','activityMinutes'].some(key=>d[key]!==expected[key]))errors.push('出发、交通或游玩汇总与重新核算不符');
        if(d.stops.length>(s.pace==='relaxed'?3:4))errors.push('景点数量超过共同节奏');
      }
    }
    const minimumCost=70+(d.stops||[]).reduce((n,stop)=>n+(local[stop.placeId]?.cost||0)+(local[stop.placeId]?.accessCost||0),0);
    if(!Number.isFinite(d.budget)||d.budget<minimumCost)errors.push('未计入必要的门票、餐饮或远程交通预留');
    if(d.walk<(d.stops||[]).reduce((n,stop)=>n+(local[stop.placeId]?.walk||0),0)-.01)errors.push('步行估算遗漏了景点内步行');
    if(!Number.isFinite(d.walk)||d.walk>s.maxWalk+.01)errors.push('预计步行超过成员上限');
    if(!Number.isFinite(d.startHour)||d.startHour<s.startHour)errors.push('出门时间早于成员限制');
    if(!Number.isFinite(d.endMinute)||d.endMinute>18*60)errors.push('当天结束时间不合理，请重新整理');
    const intervals=(d.stops||[]).map(stop=>[stop.startMinute,stop.endMinute]);
    const breaks=Array.isArray(d.breaks)?d.breaks:[];
    if(!breaks.some(b=>!b.kind&&b.minutes>=60))errors.push('尚未留出午餐休息时间');
    for(const b of breaks){
      if(b.withinPlaceId){
        const stop=d.stops?.find(stop=>stop.placeId===b.withinPlaceId);
        if(!stop||!local[b.withinPlaceId]?.exclusiveDay||d.stops.length!==1||b.kind||b.minutes!==60||!Number.isFinite(b.startMinute)||b.startMinute<stop.startMinute||b.startMinute+b.minutes>stop.endMinute||breaks.filter(x=>x.withinPlaceId).length!==1)errors.push('景区内午休时间不完整或不合理');
      }else intervals.push([b.startMinute,b.startMinute+b.minutes]);
    }
    if(d.stops?.some(stop=>local[stop.placeId]?.exclusiveDay)&&!breaks.some(b=>b.withinPlaceId===d.stops[0].placeId))errors.push('独立景区行程缺少园内午休');
    intervals.sort((a,b)=>a[0]-b[0]);
    for(let i=0;i<intervals.length;i++){
      const [begin,end]=intervals[i];
      if(!Number.isFinite(begin)||!Number.isFinite(end)||begin<s.startHour*60||end<=begin||end>d.endMinute)errors.push('活动时间不完整或不合理');
      if(i&&begin<intervals[i-1][1])errors.push('活动或休息时间重叠');
    }
  }
  const must=[...new Set(room.members.flatMap(m=>m.preferences?.must||[]))],avoid=new Set(room.members.flatMap(m=>m.preferences?.avoid||[]));
  if(must.some(id=>!seen.has(id)))errors.push('必去地点未完整纳入');
  if([...seen].some(id=>avoid.has(id)))errors.push('包含成员明确不去的地点');
  if(Math.abs(plan.budget-plan.days.reduce((n,d)=>n+d.budget,0))>.01)errors.push('合计费用与每日费用不一致');
  if(!Number.isFinite(plan.walk)||Math.abs(plan.walk-plan.days.reduce((n,d)=>n+d.walk,0))>.11)errors.push('合计步行与每日步行不一致');
  if(!Number.isFinite(plan.budget)||plan.budget>s.budget)errors.push('预计费用超过共同预算');
  return [...new Set(errors)];
}
function explicitlyAccepted(vote,proposal){return vote?.value==='accept'&&vote.version===proposal.version;}
function canFinalize(room,proposalId){
  const p=room.proposals.find(p=>p.id===proposalId);
  if(!p)return {ok:false,reason:'请先选择一份方案。'};
  if(p.inputRevision!==room.inputRevision)return {ok:false,reason:'意见已经更新，请根据新意见重新整理方案。'};
  const errors=validatePlan(room,p);if(errors.length)return {ok:false,reason:errors.join('；')};
  const pending=room.members.filter(m=>!explicitlyAccepted(room.votes[m.id]?.[p.id],p));
  return pending.length?{ok:false,reason:`还有 ${pending.length} 位旅伴尚未接受这份方案。`}:{ok:true};
}
function apply(room,uid,action,input={}){
  if(action==='join'){
    open(room);if(room.inviteToken!==input.token)fail('INVITE_INVALID','邀请已失效，请让发起人重新分享。',403);
    if(room.members.some(m=>m.id===uid))return room;
    if(room.final)fail('FINAL_LOCKED','旅行已定稿，请先由发起人重新开启讨论。',409);
    if(room.members.length>=6)fail('ROOM_FULL','这次旅行已经有 6 位成员。',409);
    room.members.push(makeMember(uid,input.nickname,room.members.length));bump(room,true);return room;
  }
  const me=member(room,uid);
  if(action==='preferences'){editable(room);me.preferences=preferences(input,room.city);bump(room,true);}
  else if(action==='comment'){editable(room);const message=text(input.text,500);if(!message)fail('EMPTY','写一点想说的话吧。');room.comments.push({id:randomUUID(),memberId:uid,text:message,placeId:roomCatalog(room.city).byId[input.placeId]?input.placeId:null,createdAt:new Date().toISOString()});room.comments=room.comments.slice(-100);bump(room);}
  else if(action==='vote'){
    editable(room);const p=room.proposals.find(p=>p.id===input.proposalId);if(!p)fail('NO_PLAN','方案不存在。',404);
    if(p.inputRevision!==room.inputRevision||input.version!==p.version)fail('STALE_PLAN','方案已经更新，请看过最新版再确认。',409);
    if(p.estimationVersion!==VERSION)fail('STALE_PLAN','交通和预算规则已更新，请重新生成方案后确认。',409);
    if(!['accept','prefer','change'].includes(input.value))fail('VOTE_INVALID','请选择你对方案的意见。');
    const reason=text(input.reason,300);if(input.value==='change'&&!reason)fail('REASON_REQUIRED','告诉大家哪一处需要调整。');
    (room.votes[uid]??={})[p.id]={value:input.value,reason,version:p.version,at:new Date().toISOString()};bump(room);
  }else if(action==='finalize'){
    host(room,uid);editable(room);const check=canFinalize(room,input.proposalId);if(!check.ok)fail('NOT_AGREED',check.reason,409);
    room.final={proposal:structuredClone(room.proposals.find(p=>p.id===input.proposalId)),confirmedAt:new Date().toISOString(),by:uid,memberIds:room.members.map(m=>m.id),votes:structuredClone(room.votes)};bump(room);
  }else if(action==='reopen'){
    host(room,uid);open(room);if(room.final){room.history.push(structuredClone(room.final));room.history=room.history.slice(-10);room.final=null;bump(room,true);}
  }else if(action==='rotateInvite'){host(room,uid);open(room);room.inviteToken=randomBytes(18).toString('base64url');bump(room);}
  else if(action==='close'){host(room,uid);room.closed=true;bump(room);}
  else if(action==='transfer'){host(room,uid);open(room);member(room,input.memberId);room.hostId=input.memberId;bump(room);}
  else if(action==='leave'){
    editable(room);if(room.hostId===uid)fail('HOST_TRANSFER','发起人需要先转交管理，或关闭这次旅行。');room.members=room.members.filter(m=>m.id!==uid);delete room.votes[uid];bump(room,true);
  }else fail('ACTION_UNKNOWN','这个操作暂不支持。');
  return room;
}
function commitPlans(room,uid,plans,expectedInputRevision,mode){
  host(room,uid);editable(room);if(room.inputRevision!==expectedInputRevision)fail('INPUT_CHANGED','生成期间有新的意见，已保留新意见。请重新生成。',409);
  if(summary(room).missing.length)fail('PREFERENCES_MISSING','等所有旅伴提交想法后再生成。',409);
  if(plans.length!==2)fail('PLAN_INVALID','没有得到两套完整方案，请重试。',502);
  for(const p of plans){const errors=validatePlan(room,p);if(errors.length)fail('PLAN_CONSTRAINT',errors.join('；'),422);}
  if(room.proposals.length)room.history.push({proposals:structuredClone(room.proposals),votes:structuredClone(room.votes),savedAt:new Date().toISOString()});
  room.history=room.history.slice(-10);room.planVersion++;room.proposals=plans.map((p,i)=>({...p,id:randomUUID(),version:room.planVersion,inputRevision:room.inputRevision,mode,createdAt:new Date().toISOString()}));room.votes={};bump(room);return room;
}
function view(room,uid){
  member(room,uid);const out=structuredClone(room),s=summary(room);out.city=room.city||'杭州';
  // The exact group minimum can identify another member's private budget.
  // Keep it in summary(room) for server-side planning, not in member responses.
  delete s.budget;
  for(const m of out.members)if(m.id!==uid&&m.preferences){delete m.preferences.budget;}
  if(uid!==room.hostId)delete out.inviteToken;
  out.me=uid;out.summary=s;out.proposals=out.proposals.map(p=>({...p,accepted:room.members.filter(m=>explicitlyAccepted(room.votes[m.id]?.[p.id],p)).length,canFinalize:canFinalize(room,p.id)}));
  if(out.final){out.final.acceptanceVerified=out.final.memberIds.every(id=>explicitlyAccepted(out.final.votes[id]?.[out.final.proposal.id],out.final.proposal));out.final.planningReviewRequired=out.final.proposal.estimationVersion!==VERSION;out.final.copyText=formatFinalItinerary(out);}
  return out;
}
module.exports={AppError,fail,text,member,host,open,editable,create,apply,summary,view,validatePlan,commitPlans,canFinalize};
