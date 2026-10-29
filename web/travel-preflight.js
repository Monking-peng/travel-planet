// Advisory only: never change preferences or promise a jointly feasible plan.
export function preferenceWarnings(preferences, places, room) {
  const selected = new Set([...(preferences.wants || []), ...(preferences.must || [])]);
  const warnings = [];
  for (const place of places.filter(p => selected.has(p.id))) {
    const reasons = [];
    const budget = Number(preferences.budget), walk = Number(preferences.maxWalk);
    const minimum = place.dayBudget ?? place.cost + 120;
    if (preferences.budget !== '' && Number.isFinite(budget) && minimum > budget)
      reasons.push(`仅此景点加餐饮、交通的规划预留就需至少 ¥${minimum}，超过你填写的整趟预算 ¥${budget}`);
    if (Number.isFinite(walk) && (place.dayWalk ?? place.walk) > walk)
      reasons.push(`${place.dayWalk?'含接驳预计步行':'景点内预计步行'} ${place.dayWalk ?? place.walk} km，超过你每天 ${walk} km 的上限`);
    if (place.latestStartHour && Number(preferences.startHour) > place.latestStartHour) reasons.push(`含往返、入场和午休，需最晚 ${place.latestStartHour}:00 出发才能在 18:00 前结束`);
    if (reasons.length) warnings.push({id:place.id, target:'limits', text:`${place.name}：${reasons.join('；')}。`});
    if (place.closedWeekdays?.length && room.startDate && Number.isInteger(Number(room.days))) {
      const dates = Array.from({length:Number(room.days)}, (_, i) => {
        const day = new Date(room.startDate + 'T12:00:00Z'); day.setUTCDate(day.getUTCDate() + i); return day;
      });
      if (dates.length && dates.every(day => place.closedWeekdays.includes(day.getUTCDay())))
        warnings.push({id:place.id, target:'place', text:`${place.name}：本次日期均在常规闭馆日，当前排程不会纳入。节假日安排请核实官方规则。`});
    }
  }
  if (places.filter(p => p.exclusiveDay && preferences.must?.includes(p.id)).length > Number(room.days))
    warnings.push({id:null,target:'restrictions',text:'必须单独安排一天的必去景点，多于本次旅行天数；请先减少必去项目。'});
  return warnings;
}

export function canRespondToPlan(room, plan, archived = false) {
  return Boolean(room && plan && !archived && !room.closed && !room.final &&
    plan.estimationVersion === 2 && plan.inputRevision === room.inputRevision &&
    room.proposals.some(current => current.id === plan.id && current.version === plan.version));
}
