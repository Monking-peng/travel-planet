const labels={accept:'可以接受',prefer:'更喜欢这份（未接受）',change:'需要修改'};

export function memberResponses(room,member){
  if(room.closed||room.final||!room.proposals?.length||room.proposals.some(p=>p.inputRevision!==room.inputRevision))return [];
  return room.proposals.map((proposal,index)=>{
    const stored=room.votes?.[member.id]?.[proposal.id],vote=stored?.version===proposal.version&&labels[stored.value]?stored:null;
    return {id:proposal.id,letter:String.fromCharCode(65+index),title:proposal.title,value:vote?.value||'',label:vote?labels[vote.value]:'还没有回应',reason:vote?.value==='change'?vote.reason||'':''};
  });
}

export function memberSummary(room,member,placeName=()=>null){
  if(room.closed)return {text:'旅行已关闭',kind:'closed'};
  if(room.final)return {text:room.final.acceptanceVerified===false?'历史定稿待复核':'已一起决定',kind:room.final.acceptanceVerified===false?'waiting':'final'};
  if(!member.preferences)return {text:'还没写想法',kind:'waiting'};
  if(room.proposals?.some(p=>p.inputRevision!==room.inputRevision))return {text:'等待新方案',kind:'waiting'};
  const responses=memberResponses(room,member);
  if(responses.length){
    const accepted=responses.filter(r=>r.value==='accept'),changes=responses.filter(r=>r.value==='change'),preferred=responses.filter(r=>r.value==='prefer');
    let text='还没回应方案',kind='waiting';
    if(accepted.length===responses.length){text=responses.length===2?'两份都能接受':'全部都能接受';kind='accept';}
    else if(accepted.length){text='接受 '+accepted.map(r=>r.letter).join('、');kind='accept';if(changes.length)text+=' · '+changes.map(r=>r.letter).join('、')+' 想改';}
    else if(changes.length){text=changes.length===responses.length?(responses.length===2?'两份都想调整':'全部都想调整'):changes.map(r=>r.letter).join('、')+' 想调整';kind='change';}
    else if(preferred.length){text='偏好 '+preferred.map(r=>r.letter).join('、')+' · 未接受';kind='prefer';}
    return {text,kind,detail:responses.map(r=>'方案 '+r.letter+'：'+r.label+(r.reason?'，'+r.reason:'')).join('；')};
  }
  const p=member.preferences,must=p.must?.map(placeName).find(Boolean),want=p.wants?.map(placeName).find(Boolean);
  // Display submitted words or explicit choices, never infer motives from a
  // departure time, walking limit, budget, or other numeric constraint.
  const text=must?'必去'+must:want?'想去'+want:p.text?.replace(/\s+/g,' ').trim()||p.tags?.[0]||'想法已提交';
  return {text,kind:'idea'};
}
