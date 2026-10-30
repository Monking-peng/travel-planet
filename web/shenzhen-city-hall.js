import * as THREE from 'three';
import {skin,glow,plaza,palm,bollards,people} from './shenzhen-forms.js';

// The south facade has a yellow round tower on the left and a red square tower
// on the right. The civic passage remains open beneath the central roof slot.
const roofHeight=x=>.245+.070*Math.cos(x/.71*Math.PI*1.55)+.005*(Math.abs(x)/.71)**6;
const roofPoint=(x,z)=>[x,roofHeight(x)+.007*Math.cos((z+.075)/.225*Math.PI/2),z];

function cladding(k,color,key,night){
  const m=k.mat(color,.68,.24,color);m.userData.night.intensity=night;
  m.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vCivicPanel;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCivicPanel=position;');
    s.fragmentShader='varying vec3 vCivicPanel;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 cell=fract(vec2(vCivicPanel.x*80.0,vCivicPanel.z*64.0));
      float joint=max(1.0-smoothstep(.025,.065,cell.x),1.0-smoothstep(.025,.065,cell.y));
      diffuseColor.rgb*=mix(1.0,.88,joint);`);
  };
  m.customProgramCacheKey=()=>`civic-panel-${key}`;return m;
}

function slopedTower(k,g,round,x,material){
  const geometry=round?new THREE.CylinderGeometry(.078,.078,1,64,1):new THREE.BoxGeometry(.151,1,.174);
  const p=geometry.attributes.position,base=.112;
  for(let i=0;i<p.count;i++)p.setY(i,base+(p.getY(i)+.5)*(.366+Math.sign(x)*p.getX(i)*.30-base));
  geometry.computeVertexNormals();k.mesh(g,geometry,material,x,0,-.105);
}

function towerPanels(material,key){
  material.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vCivicTower;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCivicTower=position;');
    s.fragmentShader='varying vec3 vCivicTower;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 panel=fract(vec2((vCivicTower.x+vCivicTower.z)*65.0,vCivicTower.y*76.0));
      float joint=max(1.0-smoothstep(.018,.045,panel.x),1.0-smoothstep(.018,.045,panel.y));
      diffuseColor.rgb*=mix(1.0,.87,joint);`);
  };
  material.customProgramCacheKey=()=>`civic-tower-${key}`;
}

function glassPodium(k,g,x,glass,frame){
  const w=.267,h=.092,d=.326,y=.024,z=-.060,geometry=new THREE.BoxGeometry(w,h,d,8,4,8),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const t=p.getY(i)/h+.5;p.setX(i,p.getX(i)*(1-t*.25));}
  geometry.computeVertexNormals();k.mesh(g,geometry,glass,x,y+h/2,z);
  for(let row=0;row<=3;row++){const t=row/3,width=w*(1-t*.25),yy=y+h*t;k.box(g,width+.004,.003,d+.005,frame,x,yy,z);}
  for(let i=0;i<=7;i++){const t=i/7-.5;k.beam(g,[x+t*w,y,z+d/2+.002],[x+t*w*.75,y+h,z+d/2+.002],.0016,frame,5);}
  for(const sign of [-1,1])for(let i=0;i<=7;i++){const zz=z-d/2+i*d/7;k.beam(g,[x+sign*w/2,y,zz],[x+sign*w*.375,y+h,zz],.002,frame,5);}
  k.box(g,w*.76,.005,d+.008,frame,x,y+h+.003,z);
}

export function civic(k){
  const g=new THREE.Group(),stone=plaza(k,g,.76,.53,'#c9c9b9');
  const glass=k.glass('#64818b','#e4dabd',271);glass.userData.night.intensity=.34;
  const blue=cladding(k,'#4f7c96','roof',.055),silver=k.mat('#bcc8ca',.52,.44),underside=k.mat('#63777b',.76,.27);
  const frame=k.mat('#bac9c8',.58,.32),gold=k.mat('#d1a634',.71,.16,'#d1a634'),red=k.mat('#a64442',.76,.12,'#a64442');
  gold.userData.night.intensity=.16;red.userData.night.intensity=.13;
  towerPanels(gold,'gold');towerPanels(red,'red');
  underside.userData.night={color:new THREE.Color('#c3c8b4'),intensity:.065};
  const seam=k.mat('#8a9b9c',.7,.25),lawn=k.mat('#6f906b',.98),hedge=k.mat('#517a57',.98),paving=k.mat('#b6bab0',.95);

  for(const x of [-.493,.493]){
    k.box(g,.367,.096,.326,glass,x,.072,-.060);
    for(let row=0;row<=3;row++)k.box(g,.375,.0035,.333,frame,x,.024+row*.032,-.060);
    for(let i=0;i<=11;i++)for(const z of [-.225,.105])k.box(g,.0025,.096,.004,frame,x-.18+i*.0327,.072,z);
    k.box(g,.379,.007,.34,frame,x,.124,-.060);
  }
  glassPodium(k,g,-.18,glass,frame);glassPodium(k,g,.18,glass,frame);
  slopedTower(k,g,true,-.18,gold);slopedTower(k,g,false,.18,red);
  // Two closed roof wings, including fascia and underside, leave a real slot.
  for(const sign of [-1,1]){
    const from=sign<0?-.71:.008,to=sign<0?-.008:.71;
    for(const bottom of [false,true])skin(k,g,(u,v)=>{const x=from+(to-from)*u,z=-.30+v*.45,p=roofPoint(x,z);p[1]-=bottom?.022:0;return p;},12,72,bottom?underside:blue);
    for(const z of [-.30,.15])skin(k,g,(u,v)=>{const x=from+(to-from)*u,p=roofPoint(x,z);p[1]-=v*.022;return p;},1,72,silver);
    for(const x of [from,to])skin(k,g,(u,v)=>{const p=roofPoint(x,-.30+u*.45);p[1]-=v*.022;return p;},1,24,silver);
    for(let i=0;i<20;i++){const x=from+(to-from)*(i+.5)/20,p=roofPoint(x,.1504);k.beam(g,[p[0],p[1]-.001,p[2]],[p[0],p[1]-.021,p[2]],.00055,seam,4);}
  }
  for(let i=0;i<12;i++){const z=-.286+i*.036,y=roofPoint(0,z)[1]-.009;k.beam(g,[-.009,y,z],[.009,y,z],.0009,frame,5);}
  for(const sign of [-1,1])for(let i=0;i<6;i++)for(const z of [-.235,.10]){
    const x=sign*(.34+i*.062);
    for(const dx of [-.023,.023])k.beam(g,[x,.128,z],[x+dx,roofPoint(x+dx,z)[1]-.023,z],.0024,silver,6);
  }
  const lip=glow(k,'#dbdbbb',.23);
  for(const sign of [-1,1])for(let i=0;i<28;i++){
    const x=sign*(.32+i*.0135),next=x+sign*.0135,a=roofPoint(x,.147),b=roofPoint(next,.147);a[1]-=.020;b[1]-=.020;k.beam(g,a,b,.0008,lip,5);
  }
  // A broad, clear axis leads between the glass bases; planting stays beside it.
  for(let i=0;i<6;i++)k.box(g,.27,.003,.044,stone,0,.016+i*.0015,.40-i*.038);
  for(const x of [-.44,.44])for(const z of [.247,.387]){
    k.box(g,.285,.007,.102,paving,x,.017,z);k.box(g,.257,.008,.077,lawn,x,.022,z);
    k.box(g,.265,.012,.011,hedge,x,.028,z-.041);
  }
  for(const x of [-.635,.635])for(const z of [-.22,.10,.34])palm(k,g,x,.014,z,.115);
  const lamps=glow(k,'#f5dfad',.54);
  for(const x of [-.305,.305])for(const z of [.19,.31,.445]){
    k.cyl(g,.0018,.0025,.072,frame,x,.050,z,6);k.box(g,.017,.003,.007,frame,x,.087,z);
    k.box(g,.013,.002,.005,lamps,x,.085,z);
  }
  bollards(k,g,[[-.15,.45],[.15,.45],[-.66,.25],[.66,.25]]);
  people(k,g,[[-.07,.44],[.07,.42],[-.22,.18],[.29,.18],[-.32,.31],[.33,.41],[-.12,.14],[.10,.12]]);
  k.merge(g);
  for(const x of [-.18,.18]){
    const light=new THREE.SpotLight('#f3dfb6',0,.72,.42,.8,1.6);light.position.set(x,.045,.15);light.target.position.set(x,.25,-.105);light.userData.nightIntensity=.016;g.add(light,light.target);
  }
  return g;
}
