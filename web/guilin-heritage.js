import * as THREE from 'three';
import {palette,site,lake,paving,steps,grove,siteHeight,peak,roof,story,lantern,railing,archOpening,sign,skin,lit,polygonRoof,finish,TAU} from './guilin-kit.js';
import {lattice} from './shunde-kit.js';
function octagonalRoof(k,g,p,r,h,y,color){
 const N=8,mat=lit(k,p.tile.color,.42,color);mat.userData.pulse={speed:.40,phase:y*3};
 const pt=(u,v)=>{const a=u*TAU,s=TAU/N,b=((a+s/2)%s)-s/2,radius=r*Math.cos(s/2)/Math.cos(b),t=.001+.999*v;return [Math.sin(a)*radius*t,y+h*(1-t)**1.45+.011*t**6*(Math.abs(b)/(s/2))**7,Math.cos(a)*radius*t];};
 skin(k,g,pt,10,96,p.tile);k.line(g,Array.from({length:96},(_,i)=>pt(i/96,1)),.0022,mat,true);
 for(let i=0;i<48;i++)k.line(g,Array.from({length:7},(_,j)=>{const a=pt(i/48,.06+.94*j/6);a[1]+=.001;return a;}),.0007,p.tile);
}
function tower(k,g,p,{x,z,n,scale,gold}){
 const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(scale);g.add(t);
 const q={...p,tile:gold?k.mat('#967b46',.56,.26):k.mat('#52726a',.77,.12),wood:gold?k.mat('#b39659',.74,.16):k.mat('#afa98f',.83),pale:gold?k.mat('#c7b27c',.78):p.pale};const tone=gold?'#f4b548':'#afdce1',window=lit(k,'#38443d',.28,tone);
 k.cyl(t,.182,.19,.028,p.stone,0,.044,0,8);k.cyl(t,.164,.17,.020,p.pale,0,.066,0,8);
 for(let j=0;j<n;j++){
  const y=.076+j*.082,r=.139-j*.0072,h=.067;
  k.cyl(t,r*.78,r*.84,h,q.wood,0,y+h/2,0,8);
  for(let i=0;i<8;i++){
   const a=i/8*TAU,b=a+TAU/16;const panel=k.box(t,r*.49,h*.57,.0026,window,Math.sin(b)*r*.785,y+h*.48,Math.cos(b)*r*.785);panel.rotation.y=b;
   k.cyl(t,.0025,.003,h,q.wood,Math.sin(a)*r*.97,y+h/2,Math.cos(a)*r*.97,6);
   for(const dy of [.014,.030])k.beam(t,[Math.sin(a)*r*.98,y+dy,Math.cos(a)*r*.98],[Math.sin(a+TAU/8)*r*.98,y+dy,Math.cos(a+TAU/8)*r*.98],.0014,q.pale);
   for(let b=1;b<4;b++){const aa=a+b*TAU/32;k.beam(t,[Math.sin(aa)*r*.93,y+.010,Math.cos(aa)*r*.93],[Math.sin(aa)*r*.93,y+.032,Math.cos(aa)*r*.93],.001,q.wood);}
  }
  octagonalRoof(k,t,q,r*1.22,.032,y+h,tone);
 }
 const y=.076+n*.082;for(let j=0;j<6;j++)k.cyl(t,.008-j*.001,.013-j*.0015,.010,q.wood,0,y+j*.011,0,12);k.cyl(t,0,.005,.052,q.wood,0,y+.084,0,10);
}
export function twins(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);lake(k,g,p,.75,.59);
 tower(k,g,p,{x:.24,z:.07,n:9,scale:1.16,gold:true});tower(k,g,p,{x:-.28,z:-.10,n:7,scale:.98,gold:false});
 // Each tower has its own small lake island; the lake stays visibly open.
 for(const [x,z,rx]of [[.24,.07,.225],[-.28,-.10,.19]]){k.cyl(g,rx,rx*.98,.018,p.pale,x,.037,z,32);railing(k,g,p,Array.from({length:33},(_,i)=>[x+Math.sin(i/32*TAU)*rx,.048,z+Math.cos(i/32*TAU)*rx]),.026);}
 return finish(k,g);
}
export function jingjiang(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);paving(k,g,p,.61,.42);
 peak(k,g,{x:.14,z:-.29,h:.69,rx:.19,rz:.16,seed:2,id:'duxiu-peak'});
 const pavilion=new THREE.Group();pavilion.position.set(.203,.716,-.305);g.add(pavilion);k.cyl(pavilion,.038,.025,.012,p.stone,0,-.004,0,10);for(let i=0;i<6;i++)k.cyl(pavilion,.002,.002,.033,p.wood,Math.sin(i/6*TAU)*.025,.016,Math.cos(i/6*TAU)*.025,6);polygonRoof(k,pavilion,p,{n:6,r:.041,h:.023,y:.033});
 const gate=new THREE.Group();gate.position.z=.16;g.add(gate);k.box(gate,.84,.045,.31,p.stone,0,.048,0);
 archOpening(k,gate,p.yellow,{w:.36,h:.37,opening:.17,rise:.242,d:.12,y:.070});roof(k,gate,p,.46,.24,.060,.44);
 for(const side of [-1,1]){
  k.box(gate,.17,.225,.13,p.yellow,side*.261,.183,0);roof(k,gate,p,.23,.23,.043,.296,side*.261,0);
  k.box(gate,.042,.078,.004,p.red,side*.252,.192,.067);lattice(k,gate,side*.252,.192,.071,.034,.065,p.pale);
  k.box(gate,.048,.083,.004,p.red,side*.115,.367,.063);lattice(k,gate,side*.115,.367,.068,.039,.071,p.pale);
  lantern(k,gate,p,side*.215,.26,.111,.014);
 }
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=128;c.height=384;const ctx=c.getContext('2d');ctx.fillStyle='#aa883d';ctx.fillRect(0,0,128,384);ctx.fillStyle='#44362b';ctx.font='bold 72px Microsoft YaHei';ctx.textAlign='center';ctx.textBaseline='middle';[...'靖江王府'].forEach((v,i)=>ctx.fillText(v,64,48+i*94));const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff',.8);m.map=tx;k.mesh(gate,new THREE.PlaneGeometry(.039,.112),m,0,.340,.067);}
 steps(k,g,p,0,.47,.28,9,.070,.22);railing(k,g,p,[[-.42,.074,.325],[-.16,.074,.325]],.035);railing(k,g,p,[[.16,.074,.325],[.42,.074,.325]],.035);
 grove(k,g,(x,z)=>siteHeight(x,z,.79,.65),[[-.53,-.22,.15],[-.43,-.35,.13],[.48,-.23,.15],[.52,.17,.11]]);
 return finish(k,g,{lamps:[[-.36,.03,.39],[.36,.03,.39]],visitors:[[-.10,.035,.44],[.13,.075,.29]]});
}
export function xiaoyao(k){
 const g=new THREE.Group(),p=palette(k);p.red=p.wood;p.blue=k.mat('#394d51',.87);site(k,g,.79,.65);paving(k,g,p,.60,.47);
 k.box(g,.75,.088,.47,p.stone,0,.069,-.035);k.box(g,.80,.016,.52,p.pale,0,.119,-.035);
 for(const [w,d,y,h]of [[.61,.39,.128,.19],[.49,.32,.36,.16],[.39,.27,.555,.15]]){story(k,g,p,{w,d,y,h,z:-.035,lanterns:y<.2,open:y<.2});if(y>.2)railing(k,g,p,[[-w*.55,y,.16],[w*.55,y,.16],[w*.55,y,-.22],[-w*.55,y,-.22],[-w*.55,y,.16]],.027);}
 // A projecting entrance with its own gable distinguishes the riverside pavilion.
 for(const s of [-1,1])k.cyl(g,.006,.007,.20,p.wood,s*.12,.226,.23,8);
 const porch=new THREE.Group();porch.position.set(0,0,.23);g.add(porch);roof(k,porch,p,.32,.23,.078,.33);sign(k,porch,'逍遥楼',.105,.033,0,.294,.055,{background:'#41382e',color:'#d1b479'});
 steps(k,g,p,0,.50,.25,10,.126,.27);railing(k,g,p,[[-.39,.130,.23],[-.16,.130,.23]],.047);railing(k,g,p,[[.16,.130,.23],[.39,.130,.23]],.047);
 grove(k,g,(x,z)=>siteHeight(x,z,.79,.65),[[-.56,-.25,.13],[.53,-.20,.13]]);
 return finish(k,g,{lamps:[[-.30,.03,.40],[.30,.03,.40]],visitors:[[-.12,.033,.46],[.25,.130,.18]]});
}
