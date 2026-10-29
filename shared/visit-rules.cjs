// Conservative published regular hours, not a live availability or ticket feed.
function dateAt(start,offset){const date=new Date(start+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10);}
function closedOn(place,date){return Boolean(date&&place.closedWeekdays?.includes(new Date(date+'T12:00:00Z').getUTCDay()));}
function visitFits(place,stop,date){return !closedOn(place,date)&&stop.startMinute>=(place.openMinute??0)&&stop.startMinute<(place.lastEntryMinute??1440)&&stop.endMinute<=(place.closeMinute??1440);}
function visitNote(place){return [place.visitNote,place.costNote,place.closedWeekdays?.length?'按常规开放日排程；节假日调整、临时闭馆和余票须向场馆核实。':''].filter(Boolean).join(' ');}
module.exports={dateAt,closedOn,visitFits,visitNote};
