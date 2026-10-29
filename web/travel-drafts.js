const clone=value=>value==null?null:JSON.parse(JSON.stringify(value));
const valid=value=>value&&typeof value==='object'&&!Array.isArray(value)&&
  ['text','diet','pace'].every(key=>value[key]===undefined||typeof value[key]==='string')&&
  ['tags','wants','must','avoid'].every(key=>value[key]===undefined||Array.isArray(value[key])&&value[key].every(item=>typeof item==='string'))&&
  ['budget','maxWalk','startHour'].every(key=>value[key]===undefined||['number','string'].includes(typeof value[key]));

// Keep failed writes in this document, without claiming they survive a reload.
export function createDraftStore(getStorage=()=>localStorage){
  const memory=new Map();
  function clear(key){
    memory.set(key,{data:null,status:'clear-failed'});
    try{getStorage().removeItem(key);memory.delete(key);return true;}catch{return false;}
  }
  return {
    read(key){
      const current=memory.get(key);
      if(current?.status==='session')return clone(current);
      if(current?.status==='clear-failed')return {data:null,status:clear(key)?'empty':'clear-failed'};
      try{
        const raw=getStorage().getItem(key),data=raw===null?null:JSON.parse(raw);
        if(data!==null&&!valid(data))throw new Error('Invalid draft');
        const result={data,status:data?'saved':'empty'};memory.set(key,clone(result));return result;
      }catch{return {data:clone(current?.data),status:current?.data?'session':'unavailable'};}
    },
    write(key,data){
      const entry={data:clone(data),status:'session'};memory.set(key,entry);
      try{getStorage().setItem(key,JSON.stringify(entry.data));entry.status='saved';}catch{}
      return entry.status;
    },
    clear
  };
}
