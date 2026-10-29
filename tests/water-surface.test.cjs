const test=require('node:test'),assert=require('node:assert/strict');

test('Lake surfaces meet along every internal triangle edge without open cracks or exposed globe',async()=>{
  const {createBase}=await import('../web/planet-scene.js');
  const {LAKE_OUTLINE,REAR_WATER,PLANET_RADIUS,geoAt}=await import('../web/planet-layout.js');
  const {mergeVertices}=await import('three/addons/utils/BufferGeometryUtils.js');
  const root=createBase();
  try{
    for(const [name,outline] of [['west-lake-water',LAKE_OUTLINE],['qiantang-water',REAR_WATER]]){
      const source=root.getObjectByName(name).geometry,geometry=mergeVertices(source,1e-5),pos=geometry.attributes.position,indices=geometry.index.array,edges=new Map();
      try{
        const point=i=>[pos.getX(i),pos.getY(i),pos.getZ(i)];
        for(let i=0;i<indices.length;i+=3){
          const a=indices[i],b=indices[i+1],c=indices[i+2];
          for(const [u,v] of [[a,b],[b,c],[c,a]]){const key=u<v?`${u},${v}`:`${v},${u}`;edges.set(key,(edges.get(key)||0)+1);}
          const points=[point(a),point(b),point(c)],center=[0,1,2].map(k=>points.reduce((sum,p)=>sum+p[k],0)/3);
          assert.ok(Math.hypot(...center)>PLANET_RADIUS+.0005,`${name} face intersects the globe`);
        }
        let cracks=0;
        for(const [key,count] of edges){
          assert.ok(count<=2,`${name} has overlapping faces`);if(count!==1)continue;
          const ends=key.split(',').map(Number).map(i=>geoAt(point(i)));
          // Use the outline midpoint so long riverbanks work across 180 degrees.
          for(const end of ends)end[0]+=360*Math.round(((Math.min(...outline.map(p=>p[0]))+Math.max(...outline.map(p=>p[0])))/2-end[0])/360);
          const q=[0,1].map(k=>(ends[0][k]+ends[1][k])/2);
          const distance=Math.min(...outline.map((a,i)=>{const b=outline[(i+1)%outline.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(q[0]-a[0]-t*dx,q[1]-a[1]-t*dy);}));
          if(distance>1e-3)cracks++;
        }
        assert.equal(cracks,0,`${name} has unmatched edges inside the lake`);
      }finally{geometry.dispose();}
    }
  }finally{root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
});
