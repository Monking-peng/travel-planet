const {test}=require('node:test'),assert=require('node:assert/strict'),{sanitize}=require('../server/extraction.cjs');
test('The model cannot infer travel style or tags merely from a landmark',()=>{
  const s=sanitize({tags:['人文','湖景','散步','安静'],pace:'relaxed',must:['leifeng'],wants:['leifeng'],avoid:['sudi'],maxWalk:3,startHour:10,diet:'不吃辣'},'我一定要去雷峰塔，这次不去苏堤。每天最多走三公里，十点以后再出门，吃饭不吃辣。');
  assert.deepEqual(s.tags,[]);assert.equal(s.pace,null);assert.equal(s.maxWalk,3);assert.equal(s.startHour,10);assert.equal(s.diet,'不吃辣');assert.ok(!/[≤<>]|walk/.test(s.summary));
});
test('Explicit preferences survive while negated tags and unstated numeric fields are dropped',()=>{
  const s=sanitize({tags:['拍照','坐船','安静','自然'],pace:'relaxed',budget:500,maxWalk:3,startHour:10,diet:'素食'},'喜欢拍照，想找人少的地方慢慢逛，不想坐船。');
  assert.deepEqual(s.tags,['拍照','安静']);assert.equal(s.pace,'relaxed');assert.equal(s.budget,null);assert.equal(s.maxWalk,null);assert.equal(s.startHour,null);assert.equal(s.diet,'');
});
