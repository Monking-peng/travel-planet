import * as THREE from 'three';
import {palette,site,paving,siteHeight,grove,roof,lantern,archOpening,karstSolid,noise,polygonRoof,finish,TAU,lit} from './guilin-kit.js';
import {lattice} from './shunde-kit.js';
function verticalSign(k,g,text,x,y,z,w,h){
 if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=192;c.height=576;const ctx=c.getContext('2d');ctx.fillStyle='#865a29';ctx.fillRect(0,0,192,576);ctx.strokeStyle='#cfad60';ctx.lineWidth=9;ctx.strokeRect(8,8,176,560);ctx.fillStyle='#e1c879';ctx.font='bold 110px "Microsoft YaHei"';ctx.textAlign='center';ctx.textBaseline='middle';[...text].forEach((v,i)=>ctx.fillText(v,96,72+i*144));const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff',.9);m.map=tx;m.emissiveMap=tx;m.userData.night={color:new THREE.Color('#edd3a1'),intensity:.22};k.mesh(g,new THREE.PlaneGeometry(w,h),m,x,y,z);
}
export function jingjiang(k){
 const g=new THREE.Group(),p=palette(k);p.yellow=k.mat('#d2ad4c',.94);p.pale=k.mat('#c4c5b4',.95);site(k,g,.79,.65);paving(k,g,p,.65,.48);
 // A blunt, fractured limestone mass replaces the old conical peak.
 const field=(x,y,z)=>{
  const mass=(cx,cy,cz,rx,ry,rz)=>((Math.abs((x-cx)/rx)**2.8+Math.abs((y-cy)/ry)**2.8+Math.abs((z-cz)/rz)**2.8)**(1/2.8)-1);
  const broad=Math.min(mass(0,.27,0,.225,.31,.165),mass(-.065,.46,.015,.145,.19,.126),mass(.10,.405,-.014,.125,.20,.132));
  const rough=.13*(noise(x*19,y*14,z*20)-.5)+.032*(noise(x*57,y*37,z*51)-.5);
  return Math.max(broad+rough,-y/.10);
 };
 const rock=karstSolid(k,g,field,{id:'duxiu-peak',bounds:[[-.28,.28],[-.025,.69],[-.21,.21]],resolution:[49,71,38],x:.10,y:.024,z:-.30});rock.updateMatrixWorld(true);
 const rp=rock.geometry.attributes.position,rn=rock.geometry.attributes.normal,rc=rock.geometry.attributes.color;for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),patch=noise(x*31,y*17,z*27),moss=THREE.MathUtils.smoothstep(rn.getY(i),.35,.82)*.78+THREE.MathUtils.smoothstep(patch,.72,.90)*.35,c=new THREE.Color('#898d80').lerp(new THREE.Color('#b3b2a2'),patch*.66).lerp(new THREE.Color('#4f6b42'),Math.min(.93,moss));rc.setXYZ(i,c.r,c.g,c.b);}rc.needsUpdate=true;
 const peakY=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0)).intersectObject(rock)[0]?.point.y;
 const summit=peakY(.06,-.285),pavilion=new THREE.Group();pavilion.position.set(.06,summit+.010,-.285);g.add(pavilion);k.cyl(pavilion,.039,.029,.025,p.stone,0,-.010,0,12);for(let i=0;i<6;i++)k.cyl(pavilion,.0018,.0023,.030,p.wood,Math.sin(i/6*TAU)*.025,.014,Math.cos(i/6*TAU)*.025,6);polygonRoof(k,pavilion,p,{n:6,r:.043,h:.022,y:.030});
 const leaves=k.mat('#496047',.99);leaves.userData.landscape=true;for(let i=0;i<24;i++){const a=i*2.4,rad=.06+.12*(.5+.5*Math.sin(i*3)),x=.10+Math.cos(a)*rad,z=-.30+Math.sin(a)*rad*.68,y=peakY(x,z);if(!y||Math.hypot(x-.06,z+.285)<.053)continue;const bush=k.mesh(g,new THREE.IcosahedronGeometry(.015+(i%3)*.003,0),leaves,x,y+.004,z);bush.scale.set(1.3,.65,1);}
 const platform=k.mat('#92988b',.98),pavingMat=k.mat('#adb09f',.98);pavingMat.userData.jingjiangPaving=true;
 k.box(g,1.08,.058,.34,platform,0,.055,.16);k.box(g,1.10,.008,.36,pavingMat,0,.088,.16);
 // A clear through passage connects front and rear approaches.
 const gate=new THREE.Group();gate.position.z=.15;g.add(gate);p.yellow.userData.jingjiangWall=true;
 archOpening(k,gate,p.yellow,{w:.38,h:.395,opening:.19,rise:.285,d:.18,y:.092});roof(k,gate,p,.48,.31,.068,.487);
 const relief=k.mat('#d8b85e',.95),red=k.mat('#78412f',.92),trim=lit(k,'#a8996c',.20,'#efd4a5');
 for(const side of [-1,1]){
  const mid=side*.27;k.box(gate,.16,.306,.18,p.yellow,mid,.245,0);roof(k,gate,p,.22,.29,.053,.398,mid,0);
  const outer=side*.455;k.box(gate,.21,.190,.17,p.yellow,outer,.187,0);roof(k,gate,p,.27,.28,.039,.282,outer,0);
  for(const x of [side*.20,side*.34]){k.box(gate,.027,.290,.035,relief,x,.237,.101);k.box(gate,.038,.011,.045,relief,x,.382,.105);k.box(gate,.036,.012,.044,platform,x,.098,.105);}
  for(const x of [side*.20,side*.34,side*.56])k.box(gate,.016,.186,.026,relief,x,.187,.094);
  for(const [x,y,w,h]of [[side*.125,.431,.045,.070],[mid,.293,.055,.106],...[.39,.455,.52].map(x=>[side*x,.196,.039,.074])]){
   for(const zz of [-.093,.093]){const pane=k.mat('#543d2e',.97);k.box(gate,w,h,.004,pane,x,y,zz);lattice(k,gate,x,y,zz+Math.sign(zz)*.004,w*.87,h*.90,red);for(const sx of [-1,1])k.box(gate,.004,h+.008,.006,relief,x+sx*(w/2+.003),y,zz);for(const sy of [-1,1])k.box(gate,w+.010,.004,.006,relief,x,y+sy*(h/2+.003),zz);}
  }
  lantern(k,gate,p,side*.215,.356,.145,.018);
  for(const [w,y,x]of [[.46,.484,0],[.21,.395,mid],[.26,.279,outer]])if(x||side===1){k.box(gate,w,.007,.008,red,x,y,.145);k.box(gate,w,.003,.010,trim,x,y-.004,.148);}
 }
 // Concentric masonry archivolts keep the opening physically clear.
 for(const side of [-1,1]){
  const zz=side*.095,cy=.092+.285-.095;
  for(const r of [.101,.108,.115])k.line(gate,Array.from({length:49},(_,i)=>{const a=i/48*Math.PI;return [Math.cos(a)*r,cy+Math.sin(a)*r,zz];}),.0017,relief);
  for(let i=0;i<=30;i++){const a=i/30*Math.PI;k.beam(gate,[Math.cos(a)*.096,cy+Math.sin(a)*.096,zz],[Math.cos(a)*.116,cy+Math.sin(a)*.116,zz],.0006,platform,4);}
  for(const s of [-1,1])for(const x of [.101,.108,.115])k.box(gate,.002,cy-.092,.004,relief,s*x,(cy+.092)/2,zz);
 }
 verticalSign(k,gate,'靖江王府',0,.430,.098,.036,.095);
 // Two flanking flights leave room for the central stone relief.
 for(const side of [-1,1])for(let i=0;i<10;i++){const top=.027+(i+1)*.0065,z=.526-i*.021;k.box(g,.19,top-.016,.024,pavingMat,side*.145,(top+.016)/2,z);}
 const ramp=k.box(g,.083,.012,.221,platform,0,.061,.432);ramp.rotation.x=Math.atan2(.065,.21);
 for(let i=0;i<7;i++){const z=.501-i*.024,y=.037+i*.0074;k.line(g,[[-.027,y,z],[0,y+.002,z-.007],[.027,y,z]],.0012,p.pale);}
 // A tapered apron reaches the actual sloping globe instead of floating off the paving disc.
 const pos=[],ix=[];for(let j=0;j<=12;j++)for(let i=0;i<=8;i++){const t=j/12,z=.538+t*.080,x=(i/8*2-1)*(.25-.09*t),y=THREE.MathUtils.lerp(.027,siteHeight(x,z,.79,.65)+.002,t);pos.push(x,y,z);}for(let j=0;j<12;j++)for(let i=0;i<8;i++){const a=j*9+i,b=a+9;ix.push(a,b,a+1,a+1,b,b+1);}const apron=new THREE.BufferGeometry();apron.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));apron.setIndex(ix);apron.computeVertexNormals();k.mesh(g,apron,pavingMat);
 // Rear stairs reconnect the elevated gateway with the courtyard floor.
 for(let i=0;i<10;i++){const top=.092-i*.0065,z=-.025-i*.019;k.box(g,.20,top-.016,.022,pavingMat,0,(top+.016)/2,z);}
 for(const side of [-1,1]){
  for(let i=0;i<8;i++){const x=side*(.27+i*.035);k.box(g,.006,.046,.006,p.pale,x,.115,.325);k.ball(g,.004,p.pale,x,.141,.325);}
  k.box(g,.25,.005,.008,p.pale,side*.39,.136,.325);
  const pot=k.cyl(g,.024,.017,.031,red,side*.43,.108,.255,10);for(let i=0;i<7;i++){const a=i*2.4,xx=side*.43+Math.cos(a)*.018,zz=.255+Math.sin(a)*.018;k.beam(g,[side*.43,.123,.255],[xx,.161,zz],.0015,p.leaf);k.ball(g,.005,p.leaf,xx,.161,zz);}
 }
 grove(k,g,(x,z)=>siteHeight(x,z,.79,.65),[[-.58,-.20,.14],[-.49,-.34,.13],[.53,-.29,.14],[-.58,.20,.13],[.60,.16,.12]]);
 return finish(k,g,{lamps:[[-.32,.022,.43],[.32,.022,.43]],visitors:[[-.27,.023,.45],[.28,.093,.22]]});
}
