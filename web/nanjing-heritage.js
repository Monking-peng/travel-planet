import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hall,hip,cornice,archWall,pond,bridge} from './nanjing-kit.js';
export function mausoleum(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.68,.73);paving(k,g,p,.50,.59);
 // One continuous staircase rises to the ceremonial hall, with connected landings.
 for(let i=0;i<40;i++){const h=.224*(i+1)/40,z=.48-i*.019;k.box(g,.48,h,.0195,p.pale,0,.021+h/2,z);}
 const y=.245,z=-.29;k.box(g,.56,.035,.32,p.pale,0,y-.018,z);k.box(g,.46,.18,.20,p.pale,0,y+.09,z-.045);
 archWall(k,g,{w:.48,h:.17,d:.025,y,z:z+.085,mat:p.pale,openings:[-.15,0,.15].map(x=>({x,r:.035,spring:.070,bottom:.001}))});
 const recess=k.mat('#35423b',.93);for(const x of [-.15,0,.15]){const s=new THREE.Shape();s.moveTo(x-.035,.001);s.lineTo(x-.035,.070);s.absarc(x,.070,.035,Math.PI,0,true);s.lineTo(x+.035,.001);s.closePath();k.mesh(g,new THREE.ShapeGeometry(s),recess,0,y,z+.076);}
 for(const x of [-.285,.285]){k.box(g,.105,.18,.30,p.pale,x,y+.09,z+.015);k.box(g,.12,.014,.32,p.stone,x,y+.185,z+.015);}
 hip(k,g,.49,.25,.085,y+.18,p.blue,p.blue,0,z-.045);hip(k,g,.45,.14,.035,y+.13,p.blue,p.blue,0,z+.075);cornice(k,g,0,y+.172,z-.045,.46,.23,p.pale);
 sign(k,g,'中山陵',.10,.026,0,y+.163,z+.151,{background:'#d3d1bc',color:'#a47d36'});
 for(const s of [-1,1]){for(let i=0;i<18;i++){const zz=.46-i*.043,yy=.025+Math.min(.22,Math.max(0,(.37-zz)*.38));k.box(g,.007,.035,.007,p.pale,s*.235,yy+.018,zz);}grove(k,g,ground,Array.from({length:7},(_,i)=>[s*(.39+.03*Math.sin(i)),.44-i*.135,.13]));}
 return finish(k,g,{lamps:[[-.33,.28],[.33,.28],[-.22,-.43],[.22,-.43]],visitors:[[-.06,.40],[.07,.37]]});
}
export function museum(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.75,.59);paving(k,g,p,.65,.40);
 steps(k,g,p,0,.28,.60,12,.105,.22);k.box(g,.90,.106,.40,p.pale,0,.075,-.10);
 const brown=k.mat('#956b42',.83);hall(k,g,p,{w:.82,d:.33,h:.20,y:.13,z:-.10,roof:brown,roofEdge:p.gold});
 for(const x of [-.48,.48])hall(k,g,p,{x,z:-.13,y:.045,w:.15,d:.31,h:.13,roof:brown,roofEdge:p.gold});
 for(const s of [-1,1]){for(let i=0;i<10;i++){const x=s*(.32+i*.013);k.box(g,.004,.042,.004,p.pale,x,.15,.096);}k.box(g,.15,.004,.006,p.pale,s*.39,.174,.096);}
 sign(k,g,'南京博物院',.19,.037,0,.299,.081,{background:'#284e6d',color:'#e8bf74'});grove(k,g,ground,[[-.59,.25,.13],[.59,.25,.13]]);
 return finish(k,g,{lamps:[[-.49,.30],[.49,.30],[-.30,-.35],[.30,-.35]],visitors:[[-.15,.31],[.12,.25],[.34,.25]]});
}
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
