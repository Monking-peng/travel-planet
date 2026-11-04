import * as THREE from 'three';
import {palette,site,lake,paving,steps,grove,siteHeight,peak,roof,story,lantern,railing,archOpening,sign,skin,lit,polygonRoof,finish,TAU} from './guilin-kit.js';
import {lattice} from './shunde-kit.js';
export {twins} from './guilin-twins.js';
export {jingjiang} from './guilin-jingjiang.js';
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
