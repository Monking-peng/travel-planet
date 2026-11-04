import * as THREE from 'three';
import {palette,site,skin,sign,finish,railing,grove,sea,edge,TAU} from './xiamen-kit.js';

function tiled(k){
 const m=k.mat('#477467',.78,.06),t=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);t.needsUpdate=true;m.map=t;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 ptUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nptUv=uv;');s.fragmentShader='varying vec2 ptUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float aa=max(fwidth(ptUv.x),.008),rib=1.0-smoothstep(.06,.06+aa,abs(fract(ptUv.x)-.5));float vis=1.0-smoothstep(.4,.9,aa);float seam=smoothstep(.03,.03+max(fwidth(ptUv.y),.008),fract(ptUv.y));diffuseColor.rgb*=mix(1.0,.78+.29*rib,vis)*mix(.89,1.0,seam);`);};m.customProgramCacheKey=()=> 'putuo-glazed-tile';return m;
}
function tileSurface(k,g,p,at,rows=16,cols=64){const m=skin(k,g,at,rows,cols,p.tile),uv=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)uv.push(i/cols*90,j/rows*14);m.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return m;}
function porcelain(k,g,p,x,y,z,side=1,size=1){
 const a=new THREE.Group();a.position.set(x,y,z);a.scale.set(side*size,size,size);g.add(a);
 k.line(a,[[0,0,0],[.010,.012,0],[.019,.033,0],[.016,.046,0],[.008,.049,0],[.007,.043,0]],.0025,p.ceramic);
 k.line(a,[[.002,.003,.001],[.006,.019,.003],[.001,.030,.003]],.0015,p.blue);
 k.ball(a,.003,p.clay,.019,.034,.003);k.beam(a,[.017,.036,0],[.027,.041,0],.001,p.ceramic,5);
 for(let j=0;j<4;j++)k.beam(a,[.006+j*.003,.006+j*.006,0],[.002+j*.003,.016+j*.006,0],.0015,j%2?p.blue:p.clay,5);
}
function frieze(k,g,p,w,y,z){
 k.box(g,w,.020,.008,p.red,0,y,z);for(const dy of [-.011,.011])k.box(g,w,.002,.010,p.ceramic,0,y+dy,z);
 const n=Math.max(2,Math.round(w/.040));for(let i=0;i<n;i++){const x=((i+.5)/n-.5)*w;k.box(g,w/n*.77,.012,.009,p.blue,x,y,z+.002);const petal=k.mesh(g,new THREE.TorusGeometry(.003,.001,4,10),p.ceramic,x,y,z+.007);petal.scale.x=1.5;k.ball(g,.0018,p.gold,x,y,z+.008);}
}
function bracket(k,g,p,x,y,z){
 k.box(g,.012,.006,.014,p.red,x,y,z);for(let i=0;i<3;i++){k.box(g,.016+i*.009,.003,.014+i*.006,p.wood,x,y+.004+i*.004,z);for(const s of [-1,1])k.box(g,.005,.006,.006,p.gold,x+s*(.007+i*.003),y+.004+i*.004,z+.005+i*.003);}
}
function column(k,g,p,x,b,h,z){
 k.box(g,.021,.011,.021,p.stone,x,b+.0055,z);k.cyl(g,.008,.009,h-.026,p.stone,x,b+.012+(h-.026)/2,z,16);k.box(g,.018,.006,.018,p.stone,x,b+h-.012,z);bracket(k,g,p,x,b+h-.01,z);
}
function roof(k,g,p,w,d,h,y){
 const ridge=(w-d)*.46;
 const point=(u,v)=>{const a=u*TAU,cs=Math.cos(a),sn=Math.sin(a),n=Math.max(Math.abs(cs),Math.abs(sn)),x=cs/n*w/2,z=sn/n*d/2,t=.001+.999*v,c=Math.min(Math.abs(cs),Math.abs(sn))/.70710678;return [x*t+THREE.MathUtils.clamp(x,-ridge,ridge)*(1-t),y+h*(1-t)**1.55+.026*t**5*c**8,z*t];};
 tileSurface(k,g,p,point);const rim=Array.from({length:128},(_,i)=>point(i/128,1));k.line(g,rim,.003,p.clay,true);k.line(g,rim.map(q=>[q[0],q[1]-.004,q[2]]),.0014,p.eave,true);
 const top=Array.from({length:25},(_,i)=>{const a=i/12-1;return[a*ridge,y+h+.015*Math.abs(a)**6,0];});k.line(g,top,.004,p.ceramic);
 for(const side of [-1,1]){porcelain(k,g,p,side*ridge,y+h+.014,0,side,.8);for(const end of [-1,1]){const line=Array.from({length:17},(_,i)=>point((side>0?(end>0?.125:.875):(end>0?.375:.625)),i/16));k.line(g,line,.003,p.ceramic);const q=line.at(-1);porcelain(k,g,p,q[0],q[1],q[2],side,.66);}}
 for(let i=-2;i<=2;i++){const x=i*ridge/2;k.ball(g,.004,p.blue,x,y+h+.009,0);k.beam(g,[x,y+h+.008,0],[x,y+h+.022,0],.0018,p.ceramic,5);}
 for(const side of [-1,1])for(let i=0;i<Math.round(w/.025);i++){const x=((i+.5)/Math.round(w/.025)-.5)*w;k.beam(g,[x,y-.01,side*d*.35],[x,y-.003,side*d*.49],.002,p.wood,5);}
}
function doors(k,g,p,w,b,h,z,bays){
 for(let i=0;i<bays;i++){const x=((i+.5)/bays-.5)*w,bw=w/bays*.89;k.box(g,bw,h,.008,p.wood,x,b+h/2,z);k.box(g,bw*.78,h*.77,.003,p.pane,x,b+h*.53,z+.005);
  for(const dx of [-.5,0,.5])k.box(g,.002,h*.82,.006,p.red,x+dx*bw*.80,b+h*.51,z+.007);
  for(let j=1;j<5;j++)k.box(g,bw*.80,.002,.006,p.red,x,b+h*.15+j*h*.14,z+.007);
  for(const sx of [-1,1])k.box(g,bw*.34,h*.14,.004,p.red,x+sx*bw*.22,b+h*.15,z+.008);
 }
}
function hall(k,g,p,{z,b,w,d,h,double=false,label='',library=false}){
 const a=new THREE.Group();a.position.z=z;g.add(a);k.box(a,w+.02,b-.020,d+.045,p.stone,0,(b+.020)/2,0);k.box(a,w+.035,.006,d+.050,p.pale,0,b-.003,0);
 // The rear enclosure leaves a real, walkable-depth stone portico in front.
 k.box(a,w*.88,h,d*.48,p.red,0,b+h/2,-d*.20);doors(k,a,p,w*.84,b+.008,h*.80,.045*d,7);
 for(const sx of [-1,1]){const end=new THREE.Group();end.position.set(sx*w*.45,0,-d*.16);end.rotation.y=sx*Math.PI/2;a.add(end);doors(k,end,p,d*.50,b+.015,h*.72,0,3);}
 for(let i=0;i<7;i++){const x=((i+.5)/7-.5)*w*.85;k.box(a,w*.105,h*.73,.004,p.wood,x,b+h*.48,-d*.445);for(let j=0;j<4;j++)k.box(a,w*.10,.002,.005,p.red,x,b+h*.21+j*h*.18,-d*.448);}
 for(let i=0;i<8;i++){const x=(i/7-.5)*w*.94;column(k,a,p,x,b,h,d*.43);column(k,a,p,x,b,h,-d*.44);}
 k.box(a,w,.012,.014,p.red,0,b+h-.006,d*.43);frieze(k,a,p,w*.98,b+h+.01,d*.43);roof(k,a,p,w*1.18,d*1.25,h*.38,b+h+.024);
 if(double){const high=b+h+h*.38+.045;k.box(a,w*.70,.047,d*.62,p.red,0,high-.021,0);frieze(k,a,p,w*.69,high-.018,d*.317);roof(k,a,p,w*.91,d*.91,h*.32,high+.009);}
 if(library){const yy=b+h*.52;k.box(a,w+.013,.010,d+.03,p.red,0,yy,0);railing(k,a,p,[[-w/2,yy,d/2],[w/2,yy,d/2]],.032);}
 if(label)sign(k,a,label,w*.30,.026,0,b+h-.025,d*.442,{background:'#692c25',color:'#d1b671'});
 return a;
}
function stair(k,g,p,z0,z1,b0,b1,w,n){
 for(let i=0;i<n;i++){const top=b0+(b1-b0)*(i+1)/n,z=z0+(z1-z0)*(i+.5)/n;k.box(g,w,top-.019,Math.abs(z1-z0)/n+.001,p.stone,0,(top+.019)/2,z);k.box(g,w+.004,.002,Math.abs(z1-z0)/n+.001,p.pale,0,top-.001,z);}
 for(const sx of [-1,1])railing(k,g,p,[[sx*(w/2+.008),b0,z0],[sx*(w/2+.008),b1,z1]],.033);
}
function octRoof(k,g,p,r,h,y){
 const at=(u,v)=>{const angle=u*TAU,sector=TAU/8,local=((angle+sector/2)%sector)-sector/2,t=.001+.999*v,rr=r*Math.cos(sector/2)/Math.cos(local)*t;return[Math.sin(angle)*rr,y+h*(1-t)**1.45+.027*t**6*(Math.abs(local)/(sector/2))**6,Math.cos(angle)*rr];};
 tileSurface(k,g,p,at,16,96);const rim=Array.from({length:128},(_,i)=>at(i/128,1));k.line(g,rim,.003,p.clay,true);k.line(g,rim.map(q=>[q[0],q[1]-.004,q[2]]),.0015,p.eave,true);
 for(let i=0;i<8;i++){const a=(i+.5)*TAU/8;k.line(g,Array.from({length:17},(_,j)=>at((i+.5)/8,j/16)),.003,p.ceramic);const x=Math.sin(a)*r,z=Math.cos(a)*r;const o=new THREE.Group();o.position.set(x,y+.027,z);o.rotation.y=a-Math.PI/2;g.add(o);porcelain(k,o,p,0,0,0,1,.73);}
}
function octHall(k,g,p){
 const a=new THREE.Group();a.position.z=-.50;g.add(a);const b=.18;
 for(const [r,y,h]of [[.22,.10,.16],[.208,.182,.008]])k.cyl(a,r,r,h,p.stone,0,y,0,8);
 k.cyl(a,.127,.127,.165,p.red,0,b+.0825,0,8);const apothem=.127*Math.cos(Math.PI/8);
 for(let i=0;i<8;i++){const an=i*TAU/8,side=new THREE.Group();side.rotation.y=an;side.position.set(Math.sin(an)*apothem,0,Math.cos(an)*apothem);a.add(side);doors(k,side,p,.089,b+.007,.131,.001,3);}
 for(let i=0;i<8;i++){const an=(i+.5)*TAU/8;column(k,a,p,Math.sin(an)*.187,b,.17,Math.cos(an)*.187);}
 for(const [r,y,h]of [[.240,.358,.075],[.196,.463,.065],[.150,.558,.057],[.105,.639,.046]]){
  if(r<.24){k.cyl(a,r*.78,r*.78,.052,p.red,0,y-.023,0,8);for(let i=0;i<8;i++){const an=i*TAU/8,face=new THREE.Group();face.position.set(Math.sin(an)*r*.72,0,Math.cos(an)*r*.72);face.rotation.y=an;a.add(face);frieze(k,face,p,r*.56,y-.024,.002);}}
  octRoof(k,a,p,r,h,y);
 }
 k.cyl(a,.001,.010,.027,p.ceramic,0,.703,0,12);for(let j=0;j<3;j++)k.cyl(a,.008-j*.0018,.009-j*.0018,.003,p.clay,0,.692+j*.007,0,12);
 sign(k,a,'大悲殿',.087,.023,0,.326,.177,{background:'#692c25',color:'#d1b671'});
 const pts=[];for(let i=1;i<8;i++){const an=i*TAU/8;pts.push([Math.sin(an)*.21,b+.006,Math.cos(an)*.21]);}railing(k,a,p,pts,.040);
}
function stonePagoda(k,g,p,x,z){
 const a=new THREE.Group();a.position.set(x,0,z);g.add(a);k.cyl(a,.028,.032,.014,p.stone,0,.040,0,8);
 for(let i=0;i<7;i++){const r=.026-i*.002,y=.047+i*.024;k.cyl(a,r*.67,r*.67,.022,p.pale,0,y+.011,0,8);k.cyl(a,r,r*.92,.005,p.stone,0,y+.022,0,8);k.cyl(a,r*.50,r,.010,p.pale,0,y+.028,0,8);for(let j=0;j<8;j++){const an=j*TAU/8;k.box(a,.004,.009,.003,p.shadow,Math.sin(an)*r*.64,y+.012,Math.cos(an)*r*.64);}}
 k.cyl(a,.001,.008,.025,p.stone,0,.237,0,8);
}
export function putuo(k){
 const root=new THREE.Group(),g=new THREE.Group(),p=palette(k),ground=site(k,root,.77,.99);g.scale.z=.90;root.add(g);p.tile=tiled(k);p.red=k.mat('#713b31',.9);p.stone=k.mat('#aaa99b',.96);p.stone.onBeforeCompile=s=>{s.vertexShader='varying vec3 ptStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nptStone=position;');s.fragmentShader='varying vec3 ptStone;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\nvec2 q=vec2((ptStone.x+ptStone.z)*25.0,ptStone.y*58.0);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),aa=max(fwidth(q),vec2(.006));float seam=max(1.0-smoothstep(.025,.025+aa.x,min(f.x,1.0-f.x)),1.0-smoothstep(.028,.028+aa.y,min(f.y,1.0-f.y)));diffuseColor.rgb*=.98-seam*.12;`);};p.stone.customProgramCacheKey=()=> 'putuo-stone-courses';p.pale=k.mat('#cac7b6',.94);p.ceramic=k.mat('#c2c4b0',.76);p.blue=k.mat('#3f6571',.78);p.clay=k.mat('#a65f46',.84);p.shadow=k.mat('#3a3c32',1);p.eave=edge(k,'#a47e54','#efc48a',.38);p.pane=edge(k,'#514d3d','#e4ba7d',.24);
 k.box(g,1.10,.012,1.46,p.pale,0,.027,-.16);k.box(g,.61,.160,.22,p.stone,0,.100,-.72);k.box(g,.61,.220,.25,p.stone,0,.130,-.89);
 hall(k,g,p,{z:.44,b:.055,w:.62,d:.20,h:.115,double:true,label:'天王殿'});
 hall(k,g,p,{z:-.025,b:.085,w:.67,d:.29,h:.19,double:true,label:'大雄宝殿'});
 hall(k,g,p,{z:-.89,b:.24,w:.58,d:.20,h:.24,double:true,label:'藏经阁',library:true});octHall(k,g,p);
 stair(k,g,p,.61,.555,.034,.055,.23,5);stair(k,g,p,.235,.145,.034,.085,.25,10);stair(k,g,p,-.20,-.28,.034,.18,.18,20);k.box(g,.18,.16,.045,p.stone,0,.10,-.301);stair(k,g,p,-.73,-.781,.18,.24,.18,10);
 // Side cloisters frame the actual axial courtyards instead of filling them with unrelated houses.
 for(const sx of [-1,1]){const wing=new THREE.Group();wing.position.set(sx*.46,0,-.08);wing.rotation.y=sx*Math.PI/2;g.add(wing);hall(k,wing,p,{z:0,b:.041,w:.60,d:.13,h:.112});const rear=new THREE.Group();rear.position.set(sx*.39,0,-.67);rear.rotation.y=sx*Math.PI/2;g.add(rear);hall(k,rear,p,{z:0,b:.18,w:.36,d:.12,h:.105});}
 for(const x of [-.228,.228])stonePagoda(k,g,p,x,.25);
 sea(k,g,p,.40,.085,0,.75);const lotus=k.mat('#6e8e59',.95),flower=k.mat('#c98f93',.9);for(let i=0;i<18;i++){const a=i*2.399,x=Math.sin(a)*(.08+i*.016),z=.75+Math.cos(a)*.060,m=k.mesh(g,new THREE.CircleGeometry(.013,14),lotus,x,.028,z);m.rotation.x=-Math.PI/2;if(i%4===0)for(let j=0;j<5;j++){const q=k.mesh(g,new THREE.SphereGeometry(.004,8,6),flower,x+Math.sin(j/5*TAU)*.003,.032,z+Math.cos(j/5*TAU)*.003);q.scale.set(.8,1,.6);}}
 grove(k,g,(x,z)=>ground(x,z*.90),[[-.61,-.52,.20],[.60,-.53,.19],[-.59,.30,.12],[.59,.30,.12],[-.33,-.47,.13],[.33,-.47,.13],[-.33,-1.02,.13],[.33,-1.02,.13]]);
 return finish(k,root,{lamps:[[-.34,.034,.414],[.34,.034,.414],[-.32,.034,.144],[.32,.034,.144],[-.25,.11,-.27],[.25,.11,-.27]],visitors:[[-.07,.034,.522],[.11,.034,.189],[-.06,.085,.117],[.02,.034,.234],[.07,.18,-.27]]});
}
