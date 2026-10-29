import * as THREE from 'three';
import {at,groundRect,hall,tiledRoof,gardenTree} from './shanghai-heritage.js';

export function jingan(k){
  const g=new THREE.Group(),m={stone:k.mat('#b7b0a0'),wall:k.mat('#d3b787'),wood:k.mat('#704b31'),window:k.mat('#493f31',.5,.12,'#ffc77b'),roof:k.mat('#b79449',.43,.48),ridge:k.mat('#e0be6d',.42,.4),light:k.mat('#d2b36a',.6,.16,'#ffbf65')};
  m.window.userData.night.intensity=.7;m.light.userData.night.intensity=.9;
  const slate=k.mat('#526669',.7,.15),bronze=k.mat('#5d6553',.65,.25),goldLight=k.mat('#bf9b54',.45,.4,'#f6ba64');goldLight.userData.night.intensity=.4;
  groundRect(k,g,0,0,.66,.81,m.stone);
  const joint=k.mat('#a4a091');for(let j=-9;j<=9;j++)groundRect(k,g,0,j*.04,.63,.0013,joint,.009);
  // Aerial reference: front gate, paired side halls, central main hall and rear pagoda.
  hall(k,g,{z:.34,w:.25,d:.09,h:.075},m);
  for(const side of [-1,1]){
    hall(k,g,{x:side*.245,z:.30,w:.12,d:.12,h:.083},m);
    hall(k,g,{x:side*.245,z:.105,w:.145,d:.18,h:.075,levels:2},{...m,roof:slate});
    tiledRoof(k,at(g,side*.245,.105),.185,.22,.177,.035,m.roof,m.ridge,m.light);
    hall(k,g,{x:side*.245,z:-.18,w:.135,d:.17,h:.076,levels:2},{...m,roof:slate});
    tiledRoof(k,at(g,side*.245,-.18),.175,.21,.176,.032,m.roof,m.ridge,m.light);
  }
  hall(k,g,{z:-.045,w:.32,d:.23,h:.14,raised:.026},m);
  hall(k,g,{z:-.30,w:.36,d:.16,h:.095,levels:2},m);
  for(const x of [-.135,0,.135])k.box(g,.004,.016,.15,m.light,x,.013,.195);
  // The tall pagoda sits behind the western side of the rear hall.
  const tower=at(g,-.21,-.36);
  for(let i=0;i<5;i++){
    const w=.124-i*.014,y=.02+i*.077;
    k.box(tower,w,.061,w,m.wood,0,y+.030);
    for(const side of [-1,1])for(const x of [-.28,0,.28])k.box(tower,w*.18,.030,.002,m.window,x*w,y+.034,side*w*.505);
    tiledRoof(k,tower,w+.046,w+.044,y+.056,.032,m.roof,m.ridge,m.light);
  }
  k.cyl(tower,0,.029,.13,goldLight,0,.474,0,4);k.cyl(tower,.0015,.002,.052,m.ridge,0,.558,0,8);k.ball(tower,.004,m.ridge,0,.588);
  const incense=at(g,0,.20);k.cyl(incense,.018,.024,.021,bronze,0,.025,0,12);k.cyl(incense,.010,.016,.039,bronze,0,.053,0,8);
  tiledRoof(k,incense,.048,.047,.071,.022,bronze,bronze);k.cyl(incense,0,.004,.018,bronze,0,.103,0,8);
  for(const x of [-.014,.014])k.cyl(incense,.002,.003,.025,bronze,x,.012,0,8);
  const leaves=k.mat('#627757');for(const [x,z] of [[-.16,.15],[.16,.15],[-.31,-.06],[.31,-.06]])gardenTree(k,g,x,z,.046,leaves,m.wood);
  const pillar=at(g,.32,.34);k.cyl(pillar,.008,.011,.12,m.ridge,0,.06);for(const y of [.12,.14]){k.ball(pillar,.012,goldLight,0,y);for(let i=0;i<4;i++){const a=i*Math.PI/2;k.ball(pillar,.010,goldLight,Math.sin(a)*.017,y,Math.cos(a)*.017);}}
  return k.merge(g);
}
