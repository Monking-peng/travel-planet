import * as THREE from 'three';
import {TAU,palette,site,disc,paving,steps,hip,facade,quay,skin,glow,sign,finish,balcony} from './chongqing-kit.js';

export function raffles(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.78,.65);disc(k,g,.72,.58,.018,p.water);const plaza=k.mat('#bfb9a5',.92),silver=k.mat('#bcc7c6',.4,.43),glass=k.glass('#57737b','#e3d8b5',71);glass.userData.night.intensity=.68;
 // The podium is an actual part of Raffles: its tapering tip looks toward the confluence.
 const shape=new THREE.Shape();shape.moveTo(-.55,-.39);shape.lineTo(.55,-.39);shape.lineTo(.53,.25);shape.lineTo(.24,.42);shape.quadraticCurveTo(0,.57,-.24,.42);shape.lineTo(-.53,.25);shape.closePath();const base=k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:false}),plaza,0,.086,0);base.rotation.x=Math.PI/2;
 for(let i=0;i<8;i++){const t=i/7;k.box(g,.44-.12*t,.010,.028,p.pale,0,.083-.007*i,.36+i*.021);}
 const specs=[[-.36,.12,.82],[-.12,.12,.82],[.12,.12,.82],[.36,.12,.82],[-.18,-.19,1.16],[.18,-.19,1.16],[-.46,-.19,.82],[.46,-.19,.82]];
 specs.forEach(([x,z,h],i)=>{const w=i>3?.145:.158,d=.145,y=.085;
  const point=(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),n=Math.max(Math.abs(c),Math.abs(s)),bend=.028*v*v,top=1-.07*v;return [x+c/n*w*.5*top,y+h*v,z+s/n*d*.5*top+bend];};skin(k,g,point,30,32,glass);
  for(let j=0;j<=31;j++){const v=j/31;k.line(g,Array.from({length:32},(_,a)=>point(a/32,v)),j%6===0?.003:.0018,silver,true);}
  for(let a=0;a<8;a++)k.line(g,Array.from({length:30},(_,j)=>point(a/8,j/29)),.003,silver);
  k.box(g,w*.90,.018,d*.9,silver,x,y+h,z+.028);if(i>3&&i<6){for(const side of [-1,1])k.box(g,.004,h,.004,p.warm,x+side*w*.46,y+h/2,z+d*.5+.015);}
 });
 // Rounded transverse skybridge above exactly four front towers, not a flat slab.
 const crystal=k.mat('#7f9e9d',.21,.45);crystal.userData.night={color:new THREE.Color('#c8ddd2'),intensity:.38};
 skin(k,g,(u,v)=>[-.535+1.07*v,.962+Math.sin(u*TAU)*.075,.148+Math.cos(u*TAU)*.095],48,56,crystal);
 for(let i=0;i<=43;i++)k.line(g,Array.from({length:48},(_,j)=>[-.535+1.07*i/43,.962+Math.sin(j/48*TAU)*.076,.148+Math.cos(j/48*TAU)*.096]),.0019,silver,true);
 for(const x of [-.535,.535]){const end=k.mesh(g,new THREE.CircleGeometry(.075,40),crystal,x,.962,.148);end.rotation.y=Math.PI/2;end.scale.y=1.0;end.scale.x=1.26;}
 sign(k,g,'来福士',.15,.038,0,.15,.32,{background:'#c4bfa9',color:'#3d5357'});quay(k,g,p,.61,.32);
 return finish(k,g,{lamps:[[-.28,.35],[.28,.35],[-.57,.04],[.57,.04]],visitors:[[-.14,.35],[.16,.34],[0,.39]]});
}

export {hongya} from './chongqing-hongya.js';

export function qiansimen(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.88,.54);disc(k,g,.83,.48,.020,p.water);const white=k.mat('#d1d2c5',.7),red=k.mat('#bf5834',.6,.20),steel=k.mat('#57625f',.61,.34),light=glow(k,'#f2a763',1.1,.5,.42);white.userData.bridgeTower=true;
 const y=.265,L=1.52,z=.0;
 // One longitudinal spindle tower, a single cable plane, two usable deck levels.
 for(const sign of [-1,1]){const pts=[];for(let j=0;j<=28;j++){const t=j/28;pts.push([-.18+sign*.085*Math.sin(Math.PI*t)**.8,.043+.70*t,0]);}k.line(g,pts,.015,white);}
 k.cyl(g,.043,.060,.085,white,-.18,.06,0,12);
 k.box(g,L,.020,.14,red,0,y,0);k.box(g,L,.014,.105,steel,0,y-.075,0);
 for(const side of [-1,1]){for(let j=0;j<24;j++){const x=-L/2+j*L/24;k.beam(g,[x,y-.067,side*.061],[x+L/48,y-.006,side*.061],.004,red);k.beam(g,[x+L/48,y-.006,side*.061],[x+L/24,y-.067,side*.061],.004,red);}k.box(g,L,.002,.002,light,0,y+.012,side*.072);k.box(g,L,.003,.003,p.pale,0,y+.031,side*.066);for(let j=0;j<=40;j++)k.box(g,.002,.025,.002,p.pale,-L/2+j*L/40,y+.021,side*.066);}
 for(const side of [-1,1])for(let j=0;j<10;j++){const x=-.18+side*(.12+j*.047);k.beam(g,[-.18,.720-j*.014,.0],[x,y+.013,.0],.0015,red);}
 for(const x of [-.69,.69]){k.box(g,.08,.20,.12,p.stone,x,.12,0);k.box(g,.12,.012,.20,p.pale,x,y,0);}for(let i=0;i<18;i++)k.box(g,.025,.001,.002,p.pale,-.70+i*.08,y+.011,.025);
 return finish(k,g);
}
