import * as THREE from 'three';
import {TAU,palette,site,disc,paving,steps,hip,facade,quay,skin,glow,sign,finish,balcony} from './chongqing-kit.js';

export {raffles} from "./chongqing-raffles.js";
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
