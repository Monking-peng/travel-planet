const {test}=require('node:test'),assert=require('node:assert/strict');
test('Portrait camera preserves horizontal field of view without changing desktop framing',async()=>{
  const {viewportFov}=await import('../web/viewport-controls.js');
  assert.equal(viewportFov(35,1440,700),35);
  for(const [w,h] of [[320,460],[390,520],[760,360]]){
    const vertical=viewportFov(35,w,h)*Math.PI/180;
    const horizontal=2*Math.atan(Math.tan(vertical/2)*w/h);
    assert.ok(horizontal>=35*Math.PI/180-1e-12);
    assert.ok(Number.isFinite(vertical)&&vertical<Math.PI);
  }
});
test('Pinch, drag-return, cancellation and non-primary buttons never select landmarks',async()=>{
  const {createTapTracker}=await import('../web/viewport-controls.js'),t=createTapTracker();
  const e=(pointerId,x=0,y=0,button=0)=>({pointerId,clientX:x,clientY:y,button});
  t.down(e(1));assert.equal(t.up(e(1,2,1)),true);
  t.down(e(1));t.down(e(2,30));t.up(e(2,40));assert.equal(t.up(e(1)),false);
  t.down(e(1));t.move(e(1,50));assert.equal(t.up(e(1)),false);
  t.down(e(1));t.cancel(e(1));assert.equal(t.up(e(1)),false);
  t.down(e(1,0,0,2));assert.equal(t.up(e(1)),false);
  t.down(e(1));assert.equal(t.up(e(1)),true);
});
