import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hall,hip,cornice,archWall,pond,bridge} from './nanjing-kit.js';
export {mausoleum} from './nanjing-mausoleum.js';

export {museum} from './nanjing-museum.js';

export function fuzimiao(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.73,.68);paving(k,g,p,.61,.53);
 hall(k,g,p,{w:.54,d:.25,h:.19,y:.05,z:-.30,double:true});sign(k,g,'大成殿',.11,.024,0,.27,-.149,{background:'#263b31',color:'#d9b66b'});
 for(const side of [-1,1])hall(k,g,p,{x:side*.40,z:-.19,w:.17,d:.35,h:.12});
 // The Qinhuai pool, red screen wall, stone quay and one named pavilion.
 p.water.userData.water=true;k.box(g,1.03,.004,.23,p.water,0,.027,.33);
 for(const z of [.194,.47]){k.box(g,1.07,.025,.030,p.stone,0,.040,z);for(let i=0;i<28;i++)k.box(g,.004,.029,.004,p.pale,(i/27-.5)*1.04,.064,z);k.box(g,1.07,.003,.004,p.pale,0,.080,z);}
 k.box(g,.61,.095,.020,p.red,.06,.095,.50);hip(k,g,.65,.065,.022,.145,p.tile,p.tile,.06,.50);sign(k,g,'秦淮',.09,.035,.06,.105,.487,{background:'#9b3c2c',color:'#d9b46d'});
 const boat=new THREE.Group();g.add(boat);boat.position.set(.12,.027,.34);k.box(boat,.24,.020,.065,p.wood,0,.018,0);k.box(boat,.19,.004,.061,p.gold,0,.044,0);for(const x of [-.08,-.04,0,.04,.08])for(const z of [-.024,.024])k.box(boat,.003,.045,.003,p.red,x,.065,z);hip(k,boat,.22,.085,.025,.087,p.ochre,p.gold);k.box(boat,.20,.002,.002,p.warm,0,.048,.031);
 const pavilion=new THREE.Group();g.add(pavilion);pavilion.position.set(-.43,.02,.09);hall(k,pavilion,p,{w:.15,d:.15,h:.11,double:true});
 grove(k,g,ground,[[-.55,-.36,.12],[.55,-.36,.12]]);return finish(k,g,{lamps:[[-.28,.12],[.27,.12],[-.41,.48],[.42,.48]],visitors:[[.07,.10],[.15,.12],[-.14,.05]]});
}
