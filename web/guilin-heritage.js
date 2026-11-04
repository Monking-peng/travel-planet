import * as THREE from 'three';
import {palette,site,lake,paving,steps,grove,siteHeight,peak,roof,story,lantern,railing,archOpening,sign,skin,lit,polygonRoof,finish,TAU} from './guilin-kit.js';
import {lattice} from './shunde-kit.js';
export {twins} from './guilin-twins.js';
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
