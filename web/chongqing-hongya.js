import * as THREE from 'three';
import {site,disc,hip,glow,sign,finish,skin} from './chongqing-kit.js';
import {archWall} from './shunde-kit.js';

// A compressed riverfront elevation, based on front-day and street-night photographs.
// Timber frames, recessed rooms and open galleries have independent geometry.
export function hongya(k){
 const g=new THREE.Group();site(k,g,.81,.61);
 const wood=k.mat('#42302a',.91),frame=k.mat('#674536',.87),plaster=k.mat('#c8c1a4',.94),stone=k.mat('#817b69',.98),paving=k.mat('#a3a290',.95),tile=k.mat('#51504a',.92),tileRib=k.mat('#68665c',.92);
 const gold=glow(k,'#e4a54d',1.25),soft=glow(k,'#d8aa68',.40),lantern=glow(k,'#b93420',.78,1,.37),dark=k.mat('#2d3735',.53,.12),lit=glow(k,'#97724a',.18),bronze=k.mat('#a87f3e',.65,.22);
 plaster.userData.night={color:new THREE.Color('#c39a5e'),intensity:.19};lit.userData.night.intensity=.40;
 plaster.userData.hongyaWall=true;stone.userData.hongyaStone=true;wood.userData.hongyaTimber=true;
 disc(k,g,.73,.49,.019,paving);
 // The rock wall climbs behind the buildings, leaving the river-facing galleries open.
 const rock=k.mat('#8b8876',.98);rock.flatShading=true;rock.vertexColors=true;rock.userData.landscape=true;rock.userData.night={color:new THREE.Color('#534d3d'),intensity:.025};
 const rockMesh=skin(k,g,(u,v)=>{
  const a=u*Math.PI*2,edge=1+.022*Math.sin(a*7)+.013*Math.cos(a*13),x=Math.cos(a)*.73*v*edge,z=-.19+Math.sin(a)*.38*v*edge;
  const rear=THREE.MathUtils.smoothstep(-z,.065,.24),fall=1-THREE.MathUtils.smoothstep(v,.61,1),strata=.018*Math.sin(a*9+v*7)*Math.sin(v*Math.PI);
  return [x,.022+Math.max(0,(.44*fall+strata)*rear),z];
 },36,112,rock);
 const rp=rockMesh.geometry.attributes.position,colors=[];for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),shade=.91+.07*Math.sin(x*19+z*17)*Math.sin(y*23-z*7);colors.push(shade,shade,shade*.97);}
 rockMesh.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 for(let j=0;j<9;j++)k.box(g,1.20,.001,.001,stone,0,.020,.31+j*.018);

 function rail(x,z,w,y,side=false){
  const parts=new THREE.Group();
  k.box(parts,w,.004,.005,wood,0,y+.029,0);k.box(parts,w,.003,.005,wood,0,y+.006,0);
  const n=Math.ceil(w/.025);for(let i=0;i<=n;i++)k.box(parts,.003,.023,.004,wood,(i/n-.5)*w,y+.017,0);
  for(let i=0;i<n;i++){const xx=((i+.5)/n-.5)*w;k.box(parts,w/n*.63,.0018,.004,frame,xx,y+.015,0);}
  k.box(parts,w,.0013,.0018,soft,0,y+.031,.003);
  if(side)parts.rotation.y=Math.PI/2;parts.position.set(x,0,z);g.add(parts);
 }
 function lanternAt(x,y,z){
  k.beam(g,[x,y+.017,z],[x,y+.008,z],.0008,wood,4);
  const globe=k.mesh(g,new THREE.SphereGeometry(.006,10,8),lantern,x,y,z);globe.scale.y=1.27;
  for(const s of [-1,1])k.cyl(g,.0035,.0035,.0025,bronze,x,y+s*.008,z,8);
  k.beam(g,[x,y-.009,z],[x,y-.017,z],.0008,lantern,4);
 }
 function gable(x,z,w,d,h,y){
  // Ridge runs back-to-front so the triangular timber gable faces the river.
  const side=(s,u,v)=>[x+s*w/2*u,y+h*(1-u)**1.25+.010*u**7,z+(v-.5)*d];
  for(const s of [-1,1]){
   skin(k,g,(u,v)=>side(s,u,v),14,20,tile);
   for(let j=0;j<=Math.ceil(d/.014);j++){const zz=j/Math.ceil(d/.014);k.line(g,Array.from({length:9},(_,i)=>side(s,i/8,zz)),.0007,tileRib);}
   for(const end of [0,1])k.line(g,Array.from({length:14},(_,i)=>side(s,i/13,end)),.0016,gold);
   k.beam(g,[x+s*w/2,y+.010,z-d/2],[x+s*w/2,y+.010,z+d/2],.0016,gold);
  }
  k.beam(g,[x,y+h+.002,z-d/2-.006],[x,y+h+.002,z+d/2+.007],.003,wood);
  for(const s of [-1,1])k.beam(g,[x,y+h,z+s*d/2],[x,y+h+.014,z+s*(d/2+.019)],.0025,wood);
  const triangle=new THREE.Shape();triangle.moveTo(-w*.43,0);triangle.lineTo(w*.43,0);triangle.lineTo(0,h*.88);triangle.closePath();
  const wall=k.mesh(g,new THREE.ShapeGeometry(triangle),plaster,x,y+.007,z+d/2-.005);wall.material.side=THREE.DoubleSide;
  k.beam(g,[x-w*.43,y+.006,z+d/2-.001],[x,y+h*.88+.007,z+d/2-.001],.004,wood);k.beam(g,[x,y+h*.88+.007,z+d/2-.001],[x+w*.43,y+.006,z+d/2-.001],.004,wood);
  k.box(g,.006,h*.88,.008,wood,x,y+.007+h*.44,z+d/2);
  for(const s of [-1,1]){k.box(g,.004,h*.40,.006,wood,x+s*w*.21,y+.008+h*.20,z+d/2);k.beam(g,[x,y+h*.50,z+d/2],[x+s*w*.26,y+.009,z+d/2],.0024,wood);}
 }
 function wing({x,z,w,d,floors,bottom=.041,fh=.078,roof='gable',balconies=[],pattern=0}){
  const h=floors*fh,front=z+d/2,bays=Math.max(3,Math.round(w/.072));
  // The body is recessed behind the balcony, not a fully illuminated box.
  k.box(g,w*.95,h,d*.70,plaster,x,bottom+h/2,z-d*.12);
  for(let floor=0;floor<floors;floor++){
   const y=bottom+floor*fh,open=balconies.includes(floor),windowZ=front-(open?.052:.022);
   if(open){k.box(g,w,.007,d,wood,x,y+.004,z);rail(x,front,w,y);for(const s of [-1,1])rail(x+s*w/2,front-.025,.050,y,true);}
   k.box(g,w,.009,.016,wood,x,y+.004,windowZ+.002);k.box(g,w,.007,.016,wood,x,y+fh-.003,windowZ+.002);
   for(let j=0;j<bays;j++){
    const xx=x-w/2+(j+.5)*w/bays,bw=w/bays*.75;
    // Broad dark upper panes and pale lower panels, with a few subdued lit rooms.
    const wm=(j+floor+pattern)%4===0?lit:dark;
    const rear=z-d*.474;
    k.box(g,bw,fh*.49,.006,dark,xx,y+fh*.61,rear-.002);
    k.box(g,.003,fh*.50,.008,frame,xx,y+fh*.61,rear-.005);
    k.box(g,.010,fh,.012,wood,xx-w/bays*.5,y+fh/2,rear);
    k.box(g,w/bays,.007,.013,wood,xx,y+.004,rear-.003);
    k.box(g,bw,fh*.49,.004,wm,xx,y+fh*.61,windowZ+.011);
    k.box(g,bw,fh*.15,.006,frame,xx,y+fh*.18,windowZ+.012);
    k.box(g,.0025,fh*.50,.008,frame,xx,y+fh*.61,windowZ+.015);
    k.box(g,bw,.0025,.008,frame,xx,y+fh*.68,windowZ+.015);
   }
   for(let j=0;j<=bays;j++){
    const xx=x-w/2+j*w/bays;k.box(g,.010,fh,.016,wood,xx,y+fh/2,windowZ+.010);
    if(j===0||j===bays)k.box(g,.0018,fh*.80,.002,soft,xx,y+fh/2,windowZ+.019);
    if(open){k.box(g,.006,fh,.006,wood,xx,y+fh/2,front);k.beam(g,[xx,y+fh*.60,front],[xx,y+fh*.87,front-.020],.0028,frame);}
   }
   if(open)k.box(g,w,.002,.002,gold,x,y+fh-.007,front+.003);
   if(floor%2===1)for(const s of [-1,1])lanternAt(x+s*w*.39,y+fh*.72,front+.012);
   // Side walls stay legible when the planet turns.
   for(const s of [-1,1]){k.box(g,.012,.007,d*.76,wood,x+s*w*.476,y+.004,z-d*.12);for(let j=0;j<3;j++){const zz=z-d*.42+j*d*.25;k.box(g,.013,fh*.49,d*.16,dark,x+s*w*.478,y+fh*.61,zz);}}
  }
  for(const s of [-1,1])k.box(g,.011,h,.012,wood,x+s*w*.476,bottom+h/2,z-d*.46);
  if(roof==='gable')gable(x,z,w*1.10,d*1.13,.070,bottom+h+.004);
  if(roof==='hip')hip(k,g,w*1.10,d*1.16,.043,bottom+h+.004,tile,gold,x,z);
  return bottom+h;
 }

 // A broad rear gallery links the lower wings to the taller right-hand sign pavilion.
 wing({x:-.04,z:-.205,w:1.12,d:.24,floors:5,bottom:.205,roof:'hip',balconies:[1,4],pattern:2});
 wing({x:.29,z:-.245,w:.39,d:.25,floors:3,bottom:.589,roof:'hip',balconies:[0,2],pattern:1});
 wing({x:-.50,z:-.08,w:.24,d:.24,floors:3,bottom:.37,balconies:[2]});
 // Unequal riverfront gables and setbacks replace the old repeated tower/stall row.
 wing({x:-.49,z:.14,w:.245,d:.26,floors:4,balconies:[0],pattern:0});
 wing({x:-.202,z:.10,w:.255,d:.25,floors:5,balconies:[3],pattern:2});
 wing({x:.115,z:.055,w:.34,d:.27,floors:5,roof:'hip',balconies:[1,4],pattern:1});
 wing({x:.425,z:.19,w:.24,d:.23,floors:3,balconies:[0],pattern:3});
 wing({x:.43,z:-.035,w:.26,d:.24,floors:3,bottom:.33,balconies:[0,2],pattern:0});

 // Short upper terrace roofs and exposed knee braces make the change of levels visible.
 for(const [x,z,w,y]of [[-.20,.228,.25,.353],[.10,.205,.34,.195],[.42,.104,.29,.49]]){
  hip(k,g,w,.085,.023,y,tile,gold,x,z);for(const s of [-1,1])k.beam(g,[x+s*w*.40,y-.045,z-.010],[x+s*w*.40,y-.005,z+.030],.0035,wood);
 }
 // Street entrance has a real arch opening and a recessed dark interior.
 archWall(k,g,{w:.16,h:.162,d:.035,x:.602,y:.023,z:.19,openings:[{x:0,r:.038,spring:.075}],mat:stone});
 const archPts=Array.from({length:25},(_,i)=>[.602+Math.cos(Math.PI*i/24)*.040,.098+Math.sin(Math.PI*i/24)*.040,.212]);k.line(g,archPts,.005,plaster);
 for(const s of [-1,1])k.box(g,.009,.077,.014,plaster,.602+s*.042,.061,.214);
 hip(k,g,.185,.13,.032,.194,tile,gold,.602,.185);
 // The elevated timber portico remains visibly open beneath its floor.
 for(const x of [-.58,-.40,-.29,-.12,.0,.23]){
  k.box(g,.009,.074,.010,wood,x,.059,.275);k.beam(g,[x,.027,.275],[x+.028,.093,.275],.0027,wood);
 }
 // An external switchback stair links the low street to the high galleries.
 for(let run=0;run<3;run++){
  const back=run%2===0,base=.022+run*.156,z0=back?.27:-.16;
  for(let i=0;i<13;i++){const z=z0+(back?-1:1)*i*.033,top=base+(i+1)*.012;k.box(g,.090,.014,.034,paving,-.655,top-.007,z);}
  const za=z0+(back?-1:1)*.013,zb=z0+(back?-1:1)*.414;
  for(const side of [-1,1]){const x=-.655+side*.045;k.beam(g,[x,base+.002,za],[x,base+.145,zb],.008,stone);k.box(g,.010,base+.145,.010,stone,x,(base+.145)/2+.012,zb);k.beam(g,[x,base+.045,za],[x,base+.189,zb],.0024,wood);for(let j=0;j<=6;j++)k.box(g,.003,.029,.003,wood,x,base+.028+j*.024,za+(zb-za)*j/6);}
  k.box(g,.11,.010,.075,paving,-.655,base+.157,zb);
 }
 // The tall corner marker and large white sign are recognisable in both reference views.
 const tx=.495,tz=-.071,ty=.688;
 k.box(g,.065,.21,.065,wood,tx,ty+.105,tz);hip(k,g,.11,.11,.045,ty+.211,tile,gold,tx,tz);
 for(const side of [-1,1])k.box(g,.002,.19,.002,gold,tx+side*.030,ty+.105,tz+.034);
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=128;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#8f3625';ctx.fillRect(0,0,128,512);ctx.strokeStyle='#e5c17d';ctx.lineWidth=4;ctx.strokeRect(8,8,112,496);ctx.fillStyle='#f5d79a';ctx.font='bold 78px serif';ctx.textAlign='center';ctx.textBaseline='middle';[...String.fromCodePoint(0x6d2a,0x5d16,0x6d1e)].forEach((s,i)=>ctx.fillText(s,64,100+i*156));
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff',.7);m.map=t;m.emissiveMap=t;m.userData.night={color:new THREE.Color('#ffe1a0'),intensity:.65};k.mesh(g,new THREE.PlaneGeometry(.055,.198),m,tx,ty+.105,tz+.034);
 }
 sign(k,g,'洪崖洞',.29,.069,.29,.756,-.105,{background:'#d9d0b2',color:'#963f2b'});
 for(const [x,y,z]of [[-.5,.355,.29],[-.21,.425,.25],[.43,.27,.32],[.45,.62,.11]])lanternAt(x,y,z);

 // Pedestrians gather along the street; no row of invented miniature houses.
 const visitors=Array.from({length:27},(_,i)=>[-.57+(i%14)*.085,.38+Math.floor(i/14)*.043+(i%3)*.006]);
 finish(k,g,{lamps:[[-.61,.40],[0,.44],[.61,.39]],visitors});
 for(const x of [-.38,.32]){const light=new THREE.PointLight('#ffd49c',0,.85,2);light.position.set(x,.19,.34);light.userData.nightIntensity=.018;g.add(light);}
 return g;
}
