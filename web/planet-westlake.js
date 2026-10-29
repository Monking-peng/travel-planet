import {PLACEMENTS,PLANET_RADIUS,placementFrame} from './planet-layout.js';
import {landColorAt} from './planet-materials.js';
import {foliage} from './planet-nature.js';
import {createStreetProp} from './planet-street.js';
import {paintedWindow} from './planet-surfaces.js';
import {createHubinStreet} from './planet-hubin.js';
// Original miniature architecture inspired by West Lake / Hubin, not a survey model.
export function createWestLakePiece(id,k){
  const {THREE,C,mesh,box,cyl,orb,put,line}=k;
  const localGroundRadius=PLANET_RADIUS/(PLACEMENTS.find(p=>p.id===id)?.scale||1);
  const surfaceY=(x,z)=>Math.sqrt(localGroundRadius**2-x*x-z*z)-localGroundRadius;
  const ground=(group,o,x,z)=>{put(group,o,x,surfaceY(x,z),z);o.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(x,localGroundRadius+surfaceY(x,z),z).normalize()));return o;};
  const stone='#d3c9af',wall='#eee1c6',roof='#546b62',glass='#397b7c',wood='#956b49';
  const bakePaint=g=>{g.traverse(o=>{if(!o.isMesh||o.material.vertexColors)return;const color=o.material.color,values=new Float32Array(o.geometry.attributes.position.count*3);for(let i=0;i<values.length;i+=3){values[i]=color.r;values[i+1]=color.g;values[i+2]=color.b;}o.geometry.setAttribute('color',new THREE.Float32BufferAttribute(values,3));o.material.color.set('#ffffff');o.material.vertexColors=true;});return g;};
  const rail=(g,x1,x2,y,z)=>{for(let x=x1;x<=x2+.001;x+=.025)put(g,box(.004,.035,.004,stone,.001),x,y+.017,z);put(g,box(x2-x1+.008,.006,.007,stone,.001),(x1+x2)/2,y+.037,z);};
  const window=(g,x,y,z,w,h)=>{put(g,box(w+.011,h+.012,.009,stone,.002),x,y,z);put(g,box(w+.003,h+.003,.010,'#415b50',.001),x,y,z+.003);put(g,paintedWindow(w,h),x,y,z+.009);put(g,box(.0025,h,.004,wall,.001),x,y,z+.011);put(g,box(w+.014,.004,.018,wall,.001),x,y-h/2-.004,z+.009);};
  function shop({w=.21,d=.24,h=.18,tone=wall,awning=false,terrace=false}={}){
    const g=new THREE.Group();put(g,box(w,h+.02,d,tone,.006),0,h/2-.01);
    put(g,box(w+.012,.015,d+.014,stone,.003),0,h+.003);
    put(g,box(w-.025,.014,d-.025,roof,.003),0,h+.014);
    // Overlapping slate courses give the roof an actual edge and a fine rhythm.
    for(let row=0;row<7;row++)for(let col=0;col<8;col++){
      const tile=mesh(new THREE.PlaneGeometry((w-.027)/8-.0006,(d-.027)/7-.0005),row%2?'#627568':'#65776a');tile.rotation.x=-Math.PI/2+.020;put(g,tile,-(w-.027)/2+(col+.5)*(w-.027)/8,h+.022,-(d-.027)/2+(row+.5)*(d-.027)/7);
    }
    // Recessed storefronts, stone pilasters and projecting transoms.
    for(const x of [-w*.31,0,w*.31]){window(g,x,.052,d/2+.003,w*.25,.087);put(g,box(.009,.103,.018,stone,.002),x+w*.145,.054,d/2+.009);}
    put(g,box(w+.015,.012,.032,stone,.002),0,.109,d/2+.009);
    for(const x of [-w*.29,0,w*.29])window(g,x,.147,d/2+.004,w*.21,.041);
    put(g,box(w*.61,.023,.016,roof,.002),0,.115,d/2+.022);
    for(let i=0;i<4;i++)put(g,box(.012,.008,.002,wall,.001),-.03+i*.02,.115,d/2+.031);
    for(const side of [-1,1]){const facade=new THREE.Group();facade.rotation.y=side*Math.PI/2;for(const x of [-d*.28,0,d*.28])window(facade,x,.15,w/2+.003,.027,.044);g.add(facade);}
    const rear=new THREE.Group();rear.rotation.y=Math.PI;for(const x of [-w*.29,0,w*.29])for(const y of [.052,.147])window(rear,x,y,d/2+.004,w*.21,y<.1?.065:.041);g.add(rear);
    if(h>.22)for(const x of [-w*.29,0,w*.29])window(g,x,.205,d/2+.004,w*.21,.030);
    if(awning){for(let i=0;i<8;i++){
      const color=i%2?'#e4d3ae':'#b77d60',geometry=new THREE.PlaneGeometry(w/8-.0003,.060,1,6),pos=geometry.attributes.position;
      for(let j=0;j<pos.count;j++){const t=(pos.getY(j)+.030)/.060;pos.setXYZ(j,pos.getX(j),.115-.021*t+.004*Math.sin(t*Math.PI),d/2+.012+t*.060);}geometry.computeVertexNormals();
      const a=mesh(geometry,color);a.material.side=THREE.DoubleSide;put(g,a,-w/2+(i+.5)*w/8);
      put(g,box(w/8-.0003,.010,.0015,color,.0005),-w/2+(i+.5)*w/8,.089,d/2+.072);
    }for(const x of [-w*.35,w*.35])put(g,cyl(.002,.002,.090,wood,6),x,.045,d/2+.068);}
    // Low planters and wall lanterns belong to the shop frontage, not the path.
    for(const x of [-w*.38,w*.38]){
      put(g,box(.026,.019,.019,'#a87758',.002),x,.010,d/2+.015);
      put(g,foliage(.016,.013,.012,'#6c8860',x*50),x,.027,d/2+.015);
      put(g,box(.003,.022,.008,roof,.001),x,.082,d/2+.008);
      put(g,box(.009,.013,.009,'#caa979',.001),x,.086,d/2+.017);
      put(g,box(.012,.003,.012,roof,.001),x,.094,d/2+.017);
    }
    if(terrace){rail(g,-w*.42,w*.42,h+.02,d*.39);for(const x of [-w*.28,w*.28]){put(g,box(.047,.022,.036,stone,.003),x,h+.033,-d*.27);put(g,orb(1,'#709668',[.025,.013,.017]),x,h+.049,-d*.27);}}
    return g;
  }
  function bench(g,x,z,turn=0){const b=createStreetProp({id:'cafe-seat',type:'bench'});b.rotation.y=turn;ground(g,b,x,z);}
  function parasol(g,x,z){const t=new THREE.Group();put(t,cyl(.002,.003,.079,wood,8),0,.039);put(t,cyl(.006,.044,.017,'#e0ae86',12),0,.083);put(t,cyl(.026,.026,.006,stone,16),0,.023);put(t,cyl(.003,.004,.022,wood,6),0,.011);for(const a of [0,Math.PI]){const cx=Math.cos(a)*.038,cz=Math.sin(a)*.038;put(t,box(.019,.005,.020,wood,.002),cx,.013,cz);put(t,box(.017,.018,.005,wood,.002),Math.cos(a)*.047,.022,cz);for(const dx of [-.006,.006])for(const dz of [-.007,.007])put(t,box(.003,.012,.003,wood,.0005),cx+dx,.005,cz+dz);}ground(g,t,x,z);}
  if(id==='cafe'){
    return createHubinStreet(k);
  }
  if(id==='apartments'){
    const g=new THREE.Group();
    for(const [x,w,h,d] of [[-.13,.23,.32,.24],[.125,.21,.24,.23]]){
      const b=new THREE.Group();put(b,box(w,h+.02,d,wall,.008),0,h/2-.01);
      for(let row=0;row<4;row++){const y=.045+row*(h-.06)/4;for(let col=0;col<3;col++)window(b,-w*.3+col*w*.3,y,d/2+.004,w*.21,.040);put(b,box(w+.012,.009,d+.013,stone,.002),0,y+.030);}
      for(const angle of [Math.PI/2,Math.PI,-Math.PI/2]){const facade=new THREE.Group(),span=angle===Math.PI?w:d,front=angle===Math.PI?d/2:w/2;facade.rotation.y=angle;for(let row=0;row<4;row++)for(const x of [-span*.28,span*.28])window(facade,x,.045+row*(h-.06)/4,front+.004,span*.22,.040);b.add(facade);}
      put(b,box(w+.014,.016,d+.016,stone,.003),0,h+.006);put(b,box(w-.023,.012,d-.023,roof,.003),0,h+.018);
      rail(b,-w*.4,w*.4,h+.025,d*.40);const roofGlass=put(b,box(w*.55,.035,d*.33,glass,.003),0,h+.037,-.04);roofGlass.material.roughness=.20;roofGlass.material.metalness=.08;roofGlass.material.envMapIntensity=.7;
      for(const dx of [-w*.39,w*.39]){put(b,box(.035,.022,.055,stone,.003),dx,h+.031,-.05);put(b,orb(1,'#789b6b',[.018,.015,.028]),dx,h+.049,-.05);}
      ground(g,b,x,0);
    }
    const step=box(.43,.025,.07,stone,.003);ground(g,step,0,.16);step.position.y+=.002;return bakePaint(g);
  }
  if(id==='boat'){
    const g=new THREE.Group(),segments=64;
    const outline=(a,scale,y)=>new THREE.Vector3(.228*Math.cos(a)*scale,y+.011*Math.pow(Math.abs(Math.cos(a)),6),.073*Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),1.25)*scale);
    // A hollow, tapered hull. The keel crosses the water, while the interior
    // floor sits below the gunwale; there is no solid block filling the cabin.
    const shell=(levels,color,inward=false)=>{
      const vertices=[],indices=[];
      for(const [scale,y] of levels)for(let i=0;i<=segments;i++)vertices.push(...outline(i/segments*Math.PI*2,scale,y).toArray());
      for(let j=1;j<levels.length;j++)for(let i=0;i<segments;i++){const a=(j-1)*(segments+1)+i,b=a+segments+1;indices.push(...(inward?[a,a+1,b,b,a+1,b+1]:[a,b,a+1,b,b+1,a+1]));}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
      const o=mesh(geo,color);o.material.roughness=.58;o.material.envMapIntensity=.25;g.add(o);return o;
    };
    const levels=[[.55,-.024],[.76,-.009],[.90,.014],[.97,.036],[1,.056]];
    for(let j=0;j<levels.length-1;j++){const o=shell([levels[j],levels[j+1]],j%2?'#986b46':'#a47a51');o.name='boat-hull-strake';}
    shell([[.73,.008],[.94,.053]],'#bb946a',true).name='boat-inner-hull';
    for(const [scale,y,r,color] of [[1,.056,.0035,'#684b36'],[.945,.054,.002,'#dab382']])g.add(line(Array.from({length:65},(_,i)=>outline(i/64*Math.PI*2,scale,y)),color,r));
    for(let i=0;i<16;i++){const x=-.1425+i*.019,depth=.146*.73*Math.pow(1-((Math.abs(x)+.0085)/(.228*.73))**2,.625)-.006;const plank=put(g,box(.017,.006,depth,i%2?'#be966d':'#c7a178',.001),x,.010);plank.name='boat-floorboard';}
    for(const side of [-1,1]){
      for(let i=0;i<3;i++){const x=.153+i*.020,depth=.146*.98*Math.pow(1-((x+.010)/(.228*.98))**2,.625)-.006;put(g,box(.020,.007,depth,i%2?'#b78e64':'#c8a177',.001),side*x,.050);}
      const seat=put(g,box(.11,.008,.021,'#d6bb8d',.002),0,.042,side*.046);seat.name='boat-side-seat';
      put(g,box(.118,.020,.004,wood,.001),0,.056,side*.057);
      for(const x of [-.12,0,.12])put(g,box(.005,.038,.005,wood,.001),x,.076,side*.058);
      put(g,box(.25,.004,.005,'#c19a6a',.001),0,.096,side*.058);
      for(const x of [-.108,.108])put(g,cyl(.0025,.0035,.096,wood,8),x,.095,side*.059);
    }
    for(const x of [-.110,.110]){put(g,box(.035,.024,.080,wood,.002),x,.028);put(g,box(.045,.009,.086,'#d6bb8d',.002),x,.043);}
    put(g,cyl(.016,.016,.005,'#c4a074',20),0,.050);put(g,cyl(.003,.004,.038,wood,8),0,.028);
    for(const x of [-.007,.007]){put(g,cyl(.0027,.002,.004,wall,10),x,.054,.003);}
    // The canopy has a shallow sag between hoops, a sewn edge and a scalloped
    // valance. Small tonal variation is geometry-native and survives GLB export.
    const vertices=[],indices=[],colors=[],cloth=new THREE.Color('#e8d7b5'),shade=new THREE.Color('#cebb96'),nx=32,nz=24;
    for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
      const x=-.130+i/nx*.260,a=j/nz*Math.PI,sag=.0014*Math.sin(i/nx*Math.PI*4)**2;
      vertices.push(x,.137+Math.sin(a)*.041-sag,Math.cos(a)*.071);
      colors.push(...cloth.clone().lerp(shade,.05+.10*Math.sin(i/nx*Math.PI*8)**2).toArray());
      if(j&&i){const b=j*(nx+1)+i;indices.push(b,b-1,b-nx-1,b-1,b-nx-2,b-nx-1);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
    const canopy=mesh(geo,'#ffffff');canopy.name='boat-canvas';canopy.material.vertexColors=true;canopy.material.side=THREE.DoubleSide;g.add(canopy);
    for(const x of [-.130,-.065,0,.065,.130])g.add(line(Array.from({length:25},(_,i)=>new THREE.Vector3(x,.138+Math.sin(i/24*Math.PI)*.041,Math.cos(i/24*Math.PI)*.0715)),'#bca27b',.0012));
    for(const sign of [-1,1]){
      const edge=Array.from({length:49},(_,i)=>new THREE.Vector3(-.130+i/48*.260,.129-.003*Math.sin(i/48*Math.PI*8)**2,sign*.071));
      g.add(line(edge,'#d2bb95',.0015));
      for(let i=0;i<8;i++){const s=new THREE.Shape();s.moveTo(-.016,.137);s.lineTo(.016,.137);s.lineTo(.016,.129);s.quadraticCurveTo(0,.123,-.016,.129);s.closePath();const tab=mesh(new THREE.ShapeGeometry(s,6),'#e3d0ac');tab.material.side=THREE.DoubleSide;put(g,tab,-.114+i*.0325,0,sign*.071);}
    }
    // One continuous sweep joins its blade, shaft and stern oarlock.
    const oar=new THREE.Group();put(oar,box(.23,.005,.006,'#7d593e',.001),0,0);put(oar,box(.065,.006,.020,'#a77d52',.002),-.141,0);oar.rotation.set(0,-.50,-.13);put(g,oar,-.155,.048,.077);
    put(g,cyl(.003,.004,.028,'#684b36',8),-.162,.062,.062);
    const ring=put(g,mesh(new THREE.TorusGeometry(.011,.0025,6,24),'#dfb28c'),.115,.079,.065);ring.rotation.y=.12;
    const rope=Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*5,r=.005+i/48*.008;return new THREE.Vector3(.177+Math.cos(a)*r,.055,Math.sin(a)*r);});g.add(line(rope,'#dec396',.001));
    // Bake solid colours into vertices so the many small wooden fittings merge
    // by surface finish instead of requiring a draw call for each paint colour.
    return bakePaint(g);
  }
  if(id==='lotusPier'){
    const g=new THREE.Group();
    for(let i=0;i<12;i++)put(g,box(.028,.014,.15,i%2?'#aa825d':'#bd9469',.002),-.16+i*.03,.023,.025);
    for(const z of [-.032,.083])put(g,box(.36,.016,.014,'#78563e',.002),.005,.008,z);
    for(const x of [-.16,.17])for(const z of [-.047,.098]){put(g,cyl(.007,.010,.11,wood,10),x,.002,z);put(g,cyl(.009,.009,.005,'#c5a178',10),x,.059,z);}
    rail(g,-.16,.17,.032,.098);
    const endRail=new THREE.Group();rail(endRail,-.050,.098,.032,0);endRail.rotation.y=-Math.PI/2;put(g,endRail,-.171,0,0);
    for(const [x,top] of [[.198,.024],[.242,-.001],[.286,-.026]]){const bottom=-.085;const tread=put(g,box(.047,top-bottom,.12,stone,.002),x,(top+bottom)/2,.025);tread.name='pier-landing';}
    const buoyGeo=new THREE.TorusGeometry(.020,.005,7,20).toNonIndexed(),buoyPos=buoyGeo.attributes.position,buoyColors=[];
    const buoyWhite=new THREE.Color('#f2ead8'),buoyOrange=new THREE.Color('#bd7b55');
    for(let i=0;i<buoyPos.count;i+=3){const cx=(buoyPos.getX(i)+buoyPos.getX(i+1)+buoyPos.getX(i+2))/3,cy=(buoyPos.getY(i)+buoyPos.getY(i+1)+buoyPos.getY(i+2))/3,color=Math.cos(4*Math.atan2(cy,cx))>.4?buoyOrange:buoyWhite;for(let k=0;k<3;k++)buoyColors.push(color.r,color.g,color.b);}
    buoyGeo.setAttribute('color',new THREE.Float32BufferAttribute(buoyColors,3));
    const buoy=put(g,mesh(buoyGeo,'#ffffff'),.13,.059,.105);buoy.material.vertexColors=true;buoy.rotation.y=.1;buoy.name='pier-life-ring';
    const placement=PLACEMENTS.find(p=>p.id===id),scale=placement.scale,waterRadius=(PLANET_RADIUS+.004)/scale,originRadius=(PLANET_RADIUS+(placement.elevation??.014))/scale;
    const waterY=(x,z)=>Math.sqrt(waterRadius**2-x*x-z*z)-originRadius;
    for(const [x,z,r] of [[-.20,-.105,.03],[-.13,-.13,.038],[-.055,-.095,.028],[.02,-.14,.035],[.10,-.105,.029]]){
      const shape=new THREE.Shape();shape.moveTo(0,0);for(let i=1;i<=32;i++){const a=.2+i/32*(Math.PI*2-.4),rr=r*(1+.025*Math.sin(a*6));shape.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}shape.closePath();
      const geometry=new THREE.ShapeGeometry(shape,32),positions=geometry.attributes.position;
      for(let i=0;i<positions.count;i++){const px=x+positions.getX(i),pz=z-positions.getY(i);positions.setXYZ(i,px,waterY(px,pz),pz);}geometry.computeVertexNormals();
      const leaf=mesh(geometry,x<0?'#739c70':'#7ba57a');leaf.name='floating-lotus-leaf';leaf.material.side=THREE.DoubleSide;leaf.castShadow=false;g.add(leaf);
      for(let j=0;j<6;j++){
        const a=.5+j*.92,vertices=[],indices=[];
        for(let i=0;i<=4;i++){const d=r*.85*i/4;for(const sign of [-1,1]){const px=x+Math.cos(a)*d-Math.sin(a)*.0005*sign,pz=z+Math.sin(a)*d+Math.cos(a)*.0005*sign;vertices.push(px,waterY(px,pz)+.0004,pz);}if(i){const b=(i-1)*2;indices.push(b,b+1,b+2,b+1,b+3,b+2);}}
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const vein=mesh(geo,'#96ae80');vein.material.side=THREE.DoubleSide;vein.castShadow=false;g.add(vein);
      }
      if(x<0){const base=waterY(x,z);put(g,cyl(.001,.0015,.024,'#74956a',6),x,base+.012,z);
        for(let layer=0;layer<2;layer++)for(let j=0;j<5;j++){const a=j*Math.PI*2/5+layer*.6,s=layer?.72:1,petal=put(g,mesh(new THREE.SphereGeometry(1,12,8),layer?'#ead8be':'#d7aaa3'),x+Math.sin(a)*.006*s,base+.023+layer*.003,z+Math.cos(a)*.006*s);petal.scale.set(.006*s,.010*s,.0035*s);petal.rotation.set(Math.cos(a)*.65,0,-Math.sin(a)*.65);}
        const center=put(g,mesh(new THREE.SphereGeometry(.003,10,6),'#d3b86d'),x,base+.029,z);center.scale.y=.6;
      }
    }
    return bakePaint(g);
  }
  if(id==='bridge'){
    const g=new THREE.Group(),shape=new THREE.Shape();shape.moveTo(-.35,-.060);shape.lineTo(-.35,.07);shape.quadraticCurveTo(0,.28,.35,.07);shape.lineTo(.35,-.060);shape.lineTo(.25,-.035);shape.quadraticCurveTo(0,.235,-.25,-.035);shape.closePath();
    const body=put(g,mesh(new THREE.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:true,bevelSegments:2,bevelSize:.002,bevelThickness:.002,curveSegments:32}),stone),0,0,-.075);body.name='bridge-arch';
    const y=x=>.073+.105*(1-(x/.35)**2);
    for(const z of [-.083,.083]){const upper=[],lower=[];for(let i=0;i<=14;i++){const x=-.35+i*.05;put(g,box(.010,.039,.012,stone,.002),x,y(x)+.020,z);put(g,box(.015,.005,.017,wall,.001),x,y(x)+.041,z);put(g,box(.014,.006,.017,'#c3baa3',.001),x,y(x)+.004,z);upper.push(new THREE.Vector3(x,y(x)+.040,z));lower.push(new THREE.Vector3(x,y(x)+.016,z));}g.add(line(upper,stone,.0035));g.add(line(lower,stone,.0022));}
    // Individual paving stones follow the arch instead of horizontal plates
    // cutting through a curved deck. The visible arch ring has real stone joints.
    for(let i=0;i<28;i++){const a=-.35+i*.025+.0005,b=a+.024,vertices=[a,y(a),-.074,b,y(b),-.074,a,y(a),.074,b,y(b),.074],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex([0,2,1,2,3,1]);geo.computeVertexNormals();const paving=mesh(geo,i%3?'#ddd3b9':'#d2c7ae');paving.name='bridge-paving';g.add(paving);}
    for(const z of [-.078,.076])for(let i=0;i<15;i++){
      const a=-.25+i/15*.50+.001,b=-.25+(i+1)/15*.50-.001,inner=x=>-.035+.135*(1-(x/.25)**2),outer=x=>{const normal=new THREE.Vector2(4.32*x,1).normalize();return [x+normal.x*.020,inner(x)+normal.y*.020];};
      const s=new THREE.Shape(),oa=outer(a),ob=outer(b);s.moveTo(a,inner(a));s.lineTo(b,inner(b));s.lineTo(...ob);s.lineTo(...oa);s.closePath();put(g,mesh(new THREE.ExtrudeGeometry(s,{depth:.002,bevelEnabled:false}),i%3?'#c3baa2':'#e0d5bd'),0,0,z);
    }
    for(const side of [-1,1])for(const [i,top] of [.056,.038,.020].entries()){
      const x=side*(.369+i*.040),bottom=-.09,tread=put(g,box(.043,top-bottom,.15,i%2?'#cfc5ad':'#d9cfb6',.002),x,(top+bottom)/2);tread.name='bridge-landing';
      for(const z of [-.083,.083]){put(g,box(.010,.038,.012,stone,.002),x,top+.019,z);put(g,box(.015,.005,.017,wall,.001),x,top+.039,z);}
    }
    for(const side of [-1,1])for(const z of [-.083,.083])g.add(line([[side*.35,.113],[side*.369,.096],[side*.409,.078],[side*.449,.060]].map(([x,h])=>new THREE.Vector3(x,h,z)),stone,.0035));
    g.userData.placeId='duanqiao';return bakePaint(g);
  }
  if(id==='mountains'){
    const g=new THREE.Group(),w=1.18,d=.63,nx=44,nz=28,vertices=[],colors=[],indices=[];
    const peaks=[[-.37,-.08,.25,.25,.20],[-.08,-.13,.32,.27,.22],[.24,.04,.23,.24,.20],[.45,-.13,.16,.17,.15]];
    const low=new THREE.Color('#a0b28a'),high=new THREE.Color('#789470'),localR=localGroundRadius;
    const placement=PLACEMENTS.find(p=>p.id===id),frame=placementFrame(placement);
    // Blend neighbouring peaks smoothly and flatten their slope at the parcel
    // edge, avoiding the previous steep rectangular skirt around the hillside.
    const ridgeAt=(x,z)=>{const edge=Math.sin((x/w+.5)*Math.PI)*Math.sin((z/d+.5)*Math.PI);return Math.pow(peaks.reduce((sum,[a,b,c,s,t])=>sum+Math.pow(c*Math.exp(-(((x-a)/s)**2+((z-b)/t)**2)),6),0),1/6)*Math.pow(Math.max(0,edge),1.2);};
    const heightAt=(x,z)=>Math.sqrt(localR*localR-x*x-z*z)-localR-.018+ridgeAt(x,z);
    for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
      const x=(i/nx-.5)*w,z=(j/nz-.5)*d,h=ridgeAt(x,z);
      const shade=Math.min(1,Math.max(0,h/.28+.07*Math.sin(x*29+z*13)*Math.sin(z*21)));
      const y=heightAt(x,z),n=new THREE.Vector3(...frame.up).multiplyScalar(PLANET_RADIUS+(placement.elevation??.014)+y*placement.scale).addScaledVector(new THREE.Vector3(...frame.east),x*placement.scale).addScaledVector(new THREE.Vector3(...frame.south),z*placement.scale).normalize();
      vertices.push(x,y,z);colors.push(...landColorAt(n.x,n.y,n.z).lerp(low.clone().lerp(high,shade),THREE.MathUtils.smoothstep(h,.008,.065)).toArray());
      if(j&&i){const a=j*(nx+1)+i;indices.push(a,a-nx-1,a-1,a-1,a-nx-1,a-nx-2);}
    }
    const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geom.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geom.setIndex(indices);geom.computeVertexNormals();const hill=mesh(geom,'#ffffff');hill.material.vertexColors=true;g.add(hill);
    // The trail begins at this parcel's declared entrance. Every point follows
    // the same heightfield as the hill, including the narrow stone steps.
    const trail=new THREE.CatmullRomCurve3([[.45,.20],[.31,.15],[.18,.14],[.11,.04],[.20,-.025],[.12,-.105],[-.02,-.14],[-.15,-.12],[-.28,-.05]].map(([x,z])=>new THREE.Vector3(x,0,z)));
    const pathPoints=trail.getPoints(100),pathVertices=[],pathIndices=[];
    pathPoints.forEach((p,i)=>{const tangent=trail.getTangent(i/100),side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize().multiplyScalar(.009);for(const sign of [-1,1]){const x=p.x+side.x*sign,z=p.z+side.z*sign;pathVertices.push(x,heightAt(x,z)+.002,z);}if(i){const b=i*2;pathIndices.push(b-2,b-1,b,b-1,b+1,b);}});
    const pathGeometry=new THREE.BufferGeometry();pathGeometry.setAttribute('position',new THREE.Float32BufferAttribute(pathVertices,3));pathGeometry.setIndex(pathIndices);pathGeometry.computeVertexNormals();
    const path=mesh(pathGeometry,'#c5b897');path.name='mountain-trail';path.material.side=THREE.DoubleSide;g.add(path);
    for(let i=18;i<67;i+=4){const p=pathPoints[i],t=trail.getTangent(i/100),side=new THREE.Vector3(-t.z,0,t.x).normalize().multiplyScalar(.0095);g.add(line([-1,1].map(sign=>{const x=p.x+side.x*sign,z=p.z+side.z*sign;return new THREE.Vector3(x,heightAt(x,z)+.004,z);}),stone,.0018));}
    // Interlocking, low forest masses follow the slopes. Keep the trail open
    // and stay inside this one woodland parcel; no globe-wide random trees.
    const palette=['#6f8e6a','#789773','#89a478','#5f8266','#94ab7e'];
    for(let row=0;row<6;row++)for(let col=0;col<12;col++){
      const seed=row*12+col,x=-.47+col*.081+.013*Math.sin(seed*2.17),z=-.22+row*.078+.014*Math.cos(seed*1.43);
      const r=.042+.009*(1+Math.sin(seed*1.7)),depth=r*(.74+.16*Math.cos(seed));
      if(pathPoints.some(p=>Math.hypot(p.x-x,p.z-z)<r+.014))continue;
      const h=heightAt(x,z),groundHeight=Math.sqrt(localR*localR-x*x-z*z)-localR;
      if(h-groundHeight<.016)continue;
      const ry=.036+.010*(1+Math.sin(seed*.91)),tone=palette[seed%palette.length];
      // Three overlapping lobes give each low canopy a wooded silhouette.
      put(g,foliage(r*.72,ry,depth*.74,tone,seed*.8,8),x,h+ry*.65,z);
      for(const side of [-1,1])put(g,foliage(r*.62,ry*.72,depth*.72,tone,seed*.8+side,8),x+side*r*.42,h+ry*.40,z+side*depth*.18);
    }
    // A low woodland edge joins the western slopes to the lakeside walk.
    // Stay within the mountain parcel and leave the trail entrance clear.
    for(const [i,[x,z]] of [[-.42,.16],[-.35,.22],[-.27,.18],[-.18,.12],[-.08,.20],[.01,.14],[.08,.20]].entries()){
      const r=.052+.006*Math.cos(i*2.1),depth=r*.85;
      if(pathPoints.some(p=>Math.hypot(p.x-x,p.z-z)<r+.018))continue;
      const ground=Math.sqrt(localR*localR-x*x-z*z)-localR;
      const h=Math.max(heightAt(x,z),ground)+.002,ry=.034+.007*Math.sin(i*.9),tone=palette[(i+2)%palette.length];
      put(g,foliage(r*.72,ry,depth*.74,tone,i*.8,8),x,h+ry*.65,z);
      for(const side of [-1,1])put(g,foliage(r*.62,ry*.72,depth*.72,tone,i*.8+side,8),x+side*r*.42,h+ry*.40,z+side*depth*.18);
    }
    return g;
  }
  return null;
}
