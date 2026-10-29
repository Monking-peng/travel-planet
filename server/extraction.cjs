const {getCatalog}=require('../shared/catalog.cjs');
const tagWords={'乐园':/乐园|迪士尼|游乐|过山车/,'科普':/科普|天文|科学|科技馆/,'艺术':/艺术|美术|画展|看展/,'江景':/江景|黄浦江|看江|江边|江岸|江水/,'建筑':/建筑|高楼|大楼|天际线|石库门/ ,'湖景':/湖景|看湖|湖边|湖岸|湖水/,'美食':/美食|好吃|小吃|吃点|吃吃|吃喝|餐厅/,'散步':/散步|漫步|走走|慢走|步行游/,'人文':/人文|历史|文化|古迹|博物馆/,'拍照':/拍照|摄影|照片|出片/,'安静':/安静|清静|清净|人少|不吵/,'坐船':/坐船|乘船|游船|泛舟|划船/,'自然':/自然|植物|湿地|山林|花草|花海/};
const positiveMention=(text,regex)=>text.split(/[，。；！!?\n]/).some(clause=>regex.test(clause)&&!/(?:不想|不爱|不喜欢|不要|讨厌|避免).{0,6}$/.test(clause.slice(0,clause.search(regex))));
function sanitize(result,text,city){
  const {places,tags}=getCatalog(city);
  const valid=new Set(places.map(p=>p.id));const clean={};
  for(const key of ['wants','must','avoid'])clean[key]=Array.isArray(result[key])?[...new Set(result[key])].filter(id=>valid.has(id)):[];
  clean.tags=Array.isArray(result.tags)?[...new Set(result.tags)].filter(t=>tags.includes(t)&&tagWords[t]&&positiveMention(text,tagWords[t])):[];
  clean.pace=['relaxed','balanced','full'].includes(result.pace)&&/轻松|放松|悠闲|慢慢|慢一点|别太赶|不要太赶|不想太赶|多逛|多看|紧凑|充实|特种兵|刚刚好|适中/.test(text)?result.pace:null;
  clean.budget=Number.isInteger(result.budget)&&result.budget>=50&&result.budget<=10000&&/预算|花费|开销|元|块钱|人民币|[¥￥]/.test(text)?result.budget:null;
  clean.maxWalk=[3,5,8,12].includes(result.maxWalk)&&/公里|千米|km|步数|走.*里/.test(text)?result.maxWalk:null;
  clean.startHour=[8,9,10,11].includes(result.startHour)&&/点|起床|早起|出门|出发|上午|早上|\d[:：]\d/.test(text)?result.startHour:null;
  const diet=String(result.diet||'').trim().slice(0,120);clean.diet=diet&&text.includes(diet)?diet:'';
  clean.questions=Array.isArray(result.questions)?result.questions.map(String).slice(0,1):[];
  const name=id=>places.find(p=>p.id===id).name,parts=[];
  if(clean.must.length)parts.push('一定想去'+clean.must.map(name).join('、'));
  const wants=clean.wants.filter(id=>!clean.must.includes(id));if(wants.length)parts.push('想去'+wants.map(name).join('、'));
  if(clean.avoid.length)parts.push('这次不去'+clean.avoid.map(name).join('、'));
  if(clean.maxWalk)parts.push('每天步行不超过 '+clean.maxWalk+' 公里');if(clean.startHour)parts.push(clean.startHour+' 点后出门');
  if(clean.budget)parts.push('当地活动预算 '+clean.budget+' 元');if(clean.diet)parts.push(clean.diet);
  clean.summary=parts.length?parts.join('；')+'。':'检查下面的整理结果，确认后再提交。';return clean;
}
module.exports={sanitize};
