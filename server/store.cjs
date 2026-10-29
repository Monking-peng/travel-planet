const fs=require('node:fs'),path=require('node:path'),{DatabaseSync}=require('node:sqlite');
const {AppError}=require('../shared/domain.cjs');
function createStore(filename){
  if(filename!==':memory:')fs.mkdirSync(path.dirname(filename),{recursive:true});
  const db=new DatabaseSync(filename);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS rooms(id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, uid TEXT NOT NULL, nickname TEXT, created INTEGER);');
  db.exec('CREATE TABLE IF NOT EXISTS ai_usage(day TEXT NOT NULL, scope TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(day,scope));');
  db.prepare('DELETE FROM sessions WHERE created < ?').run(Date.now()-30*86400000);
  db.prepare('DELETE FROM ai_usage WHERE day < ?').run(new Date(Date.now()-7*86400000).toISOString().slice(0,10));
  const get=id=>{const row=db.prepare('SELECT data FROM rooms WHERE id=?').get(id);if(!row)throw new AppError('NOT_FOUND','没有找到这次旅行。',404);return JSON.parse(row.data);};
  return {db,get,insert(room){db.prepare('INSERT INTO rooms VALUES (?,?)').run(room.id,JSON.stringify(room));return room;},list(uid){return db.prepare('SELECT data FROM rooms').all().map(r=>JSON.parse(r.data)).filter(r=>r.members.some(m=>m.id===uid)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(r=>({id:r.id,city:r.city||'杭州',title:r.title,startDate:r.startDate,days:r.days,members:r.members.length,status:r.closed?'closed':r.final?'final':r.proposals.length?'confirm':'ideas'}));},
    update(id,fn){db.exec('BEGIN IMMEDIATE');try{const room=get(id);fn(room);db.prepare('UPDATE rooms SET data=? WHERE id=?').run(JSON.stringify(room),id);db.exec('COMMIT');return room;}catch(e){db.exec('ROLLBACK');throw e;}},
    consumeAI(scopes,now=Date.now()){
      const day=new Date(now+8*3600000).toISOString().slice(0,10);
      db.exec('BEGIN IMMEDIATE');try{
        for(const {key,max} of scopes){const row=db.prepare('SELECT count FROM ai_usage WHERE day=? AND scope=?').get(day,key);if((row?.count||0)>=max)throw new AppError('AI_DAILY_LIMIT','今天的 AI 整理次数已用完。可以继续手动填写、协商，或选择基础排程。',429);}
        for(const {key} of scopes)db.prepare('INSERT INTO ai_usage VALUES(?,?,1) ON CONFLICT(day,scope) DO UPDATE SET count=count+1').run(day,key);
        db.exec('COMMIT');return day;
      }catch(e){db.exec('ROLLBACK');throw e;}
    },
    session(token){return db.prepare('SELECT uid,nickname FROM sessions WHERE token=? AND created>=?').get(token,Date.now()-30*86400000);},createSession(token,uid){db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').run(token,uid,'',Date.now());return {uid,nickname:''};},nickname(token,nickname){db.prepare('UPDATE sessions SET nickname=? WHERE token=?').run(nickname,token);},close(){db.close();}};
}
module.exports={createStore};
