import * as THREE from 'three';
import {palette,site,hill,woodland,skin,lit,finish,sign,polygon,siteHeight} from './hongkong-kit.js';

export function peakSoffit(x){return .65+.27*(x/.51)**2;}
export function peak(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);
 const h=hill(k,g,p,{height:.19,flat:.43,cut:(x,z,y)=>{if(Math.abs(x)<.148&&z>.342&&z<.69)return Math.min(y,-.072+(.66-z)*1.125);return y;}});
 const cream=lit(k,'#c5c4b7',.07,null,'#e9dec2'),edge=k.mat('#8e9690',.86),glass=lit(k,'#405e5d',.105,null,'#aebead'),frame=k.mat('#8caaa4',.47,.25),dark=k.mat('#283d3d',.7),red=lit(k,'#893b33',.12),walk=k.mat('#b1b5ab',.93),warm=lit(k,'#eed2a0',.5);
 cream.userData.peakShell=true;glass.userData.peakGlazing=true;walk.userData.peakWalk=true;
 // The renovated tower has a glass atrium between its piers, not an empty arch.
 k.box(g,.77,.105,.49,cream,0,.188,-.015);k.box(g,.79,.022,.52,walk,0,.247,-.01);
 k.box(g,.23,.405,.39,glass,0,.462,-.006);
 for(const z of [-.206,.194]){
  for(let j=0;j<7;j++)k.box(g,.235,.004,.004,frame,0,.279+j*.06,z);
  for(const x of [-.112,0,.112])k.box(g,.004,.39,.004,frame,x,.461,z);
  // Escalator flights remain legible through the pale atrium frame.
  for(let j=0;j<5;j++){
   const a=j%2?-.094:.094,b=-a,y=.286+j*.066;
   k.beam(g,[a,y,z+.003],[b,y+.063,z+.003],.007,edge);
   k.beam(g,[a,y+.016,z+.006],[b,y+.079,z+.006],.0025,p.pale);
  }
 }
 for(const x of [-.18,.18]){
  k.box(g,.085,.405,.27,cream,x,.46,0);
  for(let j=0;j<7;j++)k.box(g,.087,.006,.274,edge,x,.512+j*.019,0);
 }
 // Sloping commercial base, recessed upper shopfronts and coloured small windows.
 for(const s of [-1,1]){
  const a=s*.22,b=s*.43;
  polygon(k,g,[[a,.24,-.254],[b,.24,-.254],[s*.393,.507,-.218],[a,.507,-.218]],cream);
  polygon(k,g,[[b,.24,-.254],[b,.24,.02],[s*.393,.507,.02],[s*.393,.507,-.218]],cream);
  k.box(g,.173,.012,.25,cream,s*.307,.508,-.096);
  for(let row=0;row<4;row++)for(let col=0;col<3;col++){
   const x=s*(.244+col*.052),y=.276+row*.047,z=-.254+(y-.24)/.267*.036;
   k.box(g,.020,.021,.012,p.pale,x,y,z-.004);
   k.box(g,.012,.013,.002,(row+col)%3===0?red:glass,x,y,z-.011);
  }
  for(let j=0;j<4;j++)k.box(g,.166,.008,.005,dark,s*.307,.448+j*.014,-.230+j*.002);
  for(let level=0;level<2;level++){
   const y=.303+level*.104,z=.191-level*.013,w=.22;
   k.box(g,w,.080,.21,glass,s*.31,y,z);
   k.box(g,w+.026,.012,.235,cream,s*.31,y+.048,z);
   k.box(g,w+.019,.008,.232,edge,s*.31,y-.044,z);
   for(let j=0;j<=5;j++)k.box(g,.002,.078,.003,frame,s*.31+(j/5-.5)*w,y,z+.107);
   k.box(g,w*.96,.012,.003,level===0?red:cream,s*.31,y+.036,z+.110);
   k.beam(g,[s*.31-w/2,y+.073,z+.119],[s*.31+w/2,y+.073,z+.119],.0017,p.steel);
   for(let j=0;j<=6;j++)k.beam(g,[s*.31-w/2+j*w/6,y+.055,z+.119],[s*.31-w/2+j*w/6,y+.073,z+.119],.0011,p.steel);
  }
 }
 k.box(g,.225,.012,.106,cream,0,.49,.243);k.box(g,.21,.069,.006,dark,0,.442,.239);
 sign(k,g,'THE PEAK',.18,.026,0,.444,.244,{background:'#283d3d',color:'#e7d7b3'});
 k.box(g,.13,.16,.008,glass,0,.334,.199);k.box(g,.005,.16,.012,frame,0,.334,.205);
 // Broad bowl walls are recessed behind a continuous curved concrete frame.
 for(const s of [-1,1]){
  const z=s*.226;
  skin(k,g,(u,v)=>{const x=(u-.5)*1.02,y=peakSoffit(x)+.029;return [x,y+(1.033-y)*v,z-s*.014];},15,80,glass);
  skin(k,g,(u,v)=>{const x=(u-.5)*1.02;return [x,peakSoffit(x)+v*.029,z];},2,80,cream);
  for(const x of [-.495,.495])k.box(g,.030,1.05-peakSoffit(x),.025,cream,x,(1.05+peakSoffit(x))/2,z);
  if(s===1){
   for(let j=0;j<6;j++){const y=.714+j*.061,span=Math.min(.485,.51*Math.sqrt(Math.max(0,(y-.680)/.27)));k.box(g,span*2,.010,.009,cream,0,y,z+.001);}
   for(let j=1;j<19;j++){const x=(j/19-.5)*.97,b=peakSoffit(x)+.034;k.beam(g,[x,b,z-.005],[x,1.03,z-.005],.002,frame);}
  }else{
   for(const cx of [-.245,.245])for(const s2 of [-1,1]){const x=cx+s2*.105,y=peakSoffit(cx)+.041;polygon(k,g,[[x-.014,1.031,z-.002],[x+.014,1.031,z-.002],[cx+.012,y,z-.002],[cx-.012,y,z-.002]],cream);}
   for(const y of [.796,.886,.972])k.box(g,.78,.004,.003,frame,0,y,z+.006);
  }
 }
 // Side viewing recesses reveal transverse beams beneath the upswept ends.
 for(const [a,b,c,d] of [[-.33,.33,-.226,.226],[-.51,-.48,-.226,.226],[.48,.51,-.226,.226],[-.48,-.33,-.226,-.133],[-.48,-.33,.133,.226],[.33,.48,-.226,-.133],[.33,.48,.133,.226]])skin(k,g,(u,v)=>{const x=a+(b-a)*u;return [x,peakSoffit(x),c+(d-c)*v];},12,32,cream);
 for(const s of [-1,1]){
  const recess=new THREE.Group();g.add(recess);
  skin(k,recess,(u,v)=>[s*(.335+u*.135),peakSoffit(s*(.335+u*.135))+.025,-.133+v*.266],10,24,dark);
  for(let j=0;j<6;j++){const x=s*(.34+j*.025),y=peakSoffit(x)-.006;k.box(g,.012,.017,.273,edge,x,y,0);}
 }
 k.box(g,1.053,.022,.474,cream,0,1.045,0);k.box(g,.975,.009,.406,walk,0,1.061,0);
 for(const z of [-.206,.206]){
  k.box(g,.967,.030,.002,glass,0,1.081,z);
  k.beam(g,[-.49,1.099,z],[.49,1.099,z],.002,p.steel);
  for(let i=0;i<=24;i++)k.beam(g,[-.48+i*.04,1.065,z],[-.48+i*.04,1.099,z],.0012,p.steel);
 }
 for(const x of [-.49,.49])k.box(g,.002,.030,.41,glass,x,1.081,0);
 k.box(g,.20,.041,.13,glass,.26,1.088,-.075);k.box(g,.213,.009,.144,cream,.26,1.114,-.075);
 // Continuous stone arrival: full-depth risers, solid side cheeks, no floating treads.
 for(let i=0;i<26;i++){const z=.66-i*.012,top=-.069+i*.013,base=siteHeight(0,z-.006,.72,.62)+.001;k.box(g,.274,top-base,.0126,walk,0,(top+base)/2,z);}
 skin(k,g,(u,v)=>{const x=(u-.5)*(.274-.022*v),z=.665+v*.035;return [x,THREE.MathUtils.lerp(-.069,siteHeight(x,z,.72,.62)+.003,v),z];},12,12,walk);
 k.box(g,.276,.022,.105,walk,0,.247,.307);
 for(const x of [-.151,.151]){
  skin(k,g,(u,v)=>{const z=.666-u*.318,base=siteHeight(x,z,.72,.62)+.001,top=-.062+u*.332;return [x,base+(top-base)*v,z];},3,32,cream);
  k.beam(g,[x,-.023,.66],[x,.302,.36],.0025,p.steel);
  for(let i=0;i<12;i++){const z=.66-i*.027,y=-.069+i*.02925;k.beam(g,[x,y,z],[x,y+.046,z],.0016,p.steel);}
 }
 for(const z of [.37,.47,.57])for(const x of [-.158,.158])k.box(g,.005,.005,.014,warm,x,-.060+(.66-z)*1.083,z);
 woodland(k,g,h,[[-.53,-.13,.14],[.54,-.15,.13],[-.48,.33,.12],[.48,.33,.13],[-.22,-.45,.11],[.22,-.45,.11]]);
 return finish(k,g,{lamps:[[-.27,.20,.34],[.27,.20,.34]],visitors:[[-.2,1.067,0],[.1,1.067,.1],[.27,1.067,.08],[.19,.26,.31]]});
}
