import * as THREE from 'three';
import {TAU,palette,site,skin,lit,finish,sign,ellipsoid,polygon,siteHeight} from './hongkong-kit.js';

function tangRoof(k,g,p,w,d,h,y,x=0,z=0,gold=false){
 const ridge=Math.max(.01,(w-d)*.46),rim=k.mat('#747c76',.96),lift=Math.min(.016,w*.038);
 const main=(u,v,side)=>{const xx=(u-.5)*(ridge*2*(1-v)+w*v);return [x+xx,y+h*Math.pow(Math.max(0,1-v),1.48)+lift*Math.pow(Math.abs(2*u-1),8)*v**5,z+side*d/2*v];};
 const hip=(u,v,side)=>[x+side*(ridge+(w/2-ridge)*v),y+h*Math.pow(Math.max(0,1-v),1.48)+lift*Math.pow(Math.abs(2*u-1),8)*v**5,z+(u-.5)*d*v];
 for(const side of [-1,1]){
  skin(k,g,(u,v)=>main(u,v,side),16,64,p.tile);skin(k,g,(u,v)=>hip(u,v,side),16,32,p.tile);
  k.line(g,Array.from({length:65},(_,i)=>main(i/64,1,side)),.0022,rim);k.line(g,Array.from({length:33},(_,i)=>hip(i/32,1,side)),.0022,rim);
  const count=Math.ceil(w/.008);
  for(let i=1;i<count;i++){
   const xx=(i/count-.5)*w,v0=Math.max(.001,(Math.abs(xx)-ridge)/(w/2-ridge));
   k.line(g,Array.from({length:14},(_,j)=>{const v=v0+(1-v0)*j/13,u=.5+xx/(ridge*2*(1-v)+w*v),q=main(u,v,side);q[1]+=.0012;return q;}),.001,rim);
  }
  const countSide=Math.ceil(d/.008);
  for(let i=1;i<countSide;i++){
   const zz=(i/countSide-.5)*d,v0=Math.max(.002,Math.abs(zz)/(d/2));
   k.line(g,Array.from({length:12},(_,j)=>{const v=v0+(1-v0)*j/11,u=.5+zz/(d*v),q=hip(u,v,side);q[1]+=.0012;return q;}),.001,rim);
  }
 }
 k.beam(g,[x-ridge,y+h+.002,z],[x+ridge,y+h+.002,z],.003,rim);
 for(const side of [-1,1])k.line(g,[[x+side*ridge,y+h,z],[x+side*(ridge+.006),y+h+.017,z],[x+side*(ridge-.004),y+h+.023,z]],gold?.004:.0024,gold?p.gold:rim);
}
function hall(k,g,p,{x=0,z=0,y=.10,w=.55,d=.23,h=.17,gate=false,double=false,label='',open=false}={}){
 const face=lit(k,'#554338',.12,null,'#bda078');face.userData.chilinWindow=true;
 k.box(g,w+.035,.016,d+.043,p.pale,x,y-.008,z);
 if(!open){
  if(gate){for(const s of [-1,1])k.box(g,(w-.102)/2,h*.91,d*.66,p.wood,x+s*(w+.102)/4,y+h*.455,z);k.box(g,.105,h*.23,d*.66,p.wood,x,y+h*.885,z);}
  else k.box(g,w*.94,h*.90,d*.65,p.wood,x,y+h*.45,z);
 }
 for(const side of [-1,1]){
  for(let j=0;j<=6;j++){
   const xx=x+(j/6-.5)*w;if(gate&&Math.abs(xx-x)<.05)continue;
   k.cyl(g,.007,.008,h,p.wood,xx,y+h/2,z+side*d*.43,12);k.cyl(g,.011,.012,.012,p.pale,xx,y+.006,z+side*d*.43,12);
   for(let l=0;l<3;l++){k.box(g,.021+l*.013,.005,.026+l*.012,p.wood,xx,y+h-.018+l*.006,z+side*d*.43);k.box(g,.010,.006,.048+l*.009,p.wood,xx,y+h-.015+l*.006,z+side*d*.43);}
  }
  k.box(g,w,.013,.013,p.wood,x,y+h-.022,z+side*d*.43);
  if(!open)for(let j=0;j<5;j++){
   const xx=x+(j-2)*w*.174;if(gate&&j===2)continue;const zz=z+side*d*.334,ww=w*.135;
   k.box(g,ww,h*.63,.002,face,xx,y+h*.45,zz);
   for(let c=0;c<8;c++)k.box(g,.0017,h*.61,.003,p.wood,xx+(c/7-.5)*ww,y+h*.45,zz+side*.0015);
   k.box(g,ww,.003,.003,p.wood,xx,y+h*.27,zz+side*.002);
  }
 }
 if(label)sign(k,g,label,w*.27,.026,x,y+h-.023,z+d*.45,{background:'#2d302a',color:'#d5b96f'});
 tangRoof(k,g,p,w*1.19,d*1.34,h*.39,y+h,x,z,double);
 if(double){
  const top=y+h+.063;k.box(g,w*.65,.066,d*.64,p.wood,x,top+.027,z);
  for(const s of [-1,1]){for(let j=0;j<=6;j++)k.box(g,.004,.050,.004,p.wood,x+(j/6-.5)*w*.68,top+.023,z+s*d*.35);k.box(g,w*.70,.005,.006,p.wood,x,top+.056,z+s*d*.36);}
  tangRoof(k,g,p,w*.88,d*1.03,h*.34,top+.062,x,z,true);
 }
}
function stoneRail(k,g,p,a,b,y){
 const dist=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(dist/.042));
 for(let i=0;i<=n;i++){const t=i/n,x=THREE.MathUtils.lerp(a[0],b[0],t),z=THREE.MathUtils.lerp(a[1],b[1],t);k.box(g,.006,.039,.006,p.pale,x,y+.018,z);k.box(g,.009,.005,.009,p.pale,x,y+.039,z);}
 for(const dy of [.012,.030])k.beam(g,[a[0],y+dy,a[1]],[b[0],y+dy,b[1]],.0026,p.pale);
}
function bonsai(k,g,p,x,z,s=1){
 const soil=k.mat('#5b5946',.98),leaf=k.mat('#456340',.95),trunk=k.mat('#5f5340',.96),y=.079;
 k.box(g,.074*s,.021,.062*s,p.pale,x,y,z);k.box(g,.068*s,.004,.057*s,soil,x,y+.013,z);
 k.line(g,[[x,y+.013,z],[x+.009*s,y+.055*s,z],[x-.005*s,y+.105*s,z]],.004*s,trunk);
 for(let i=0;i<5;i++){const a=i*2.35,yy=y+.042*s+i*.014*s,xx=x+Math.cos(a)*.027*s,zz=z+Math.sin(a)*.018*s;k.beam(g,[x,yy-.016*s,z],[xx,yy,zz],.002*s,trunk);ellipsoid(k,g,leaf,xx,yy+.007*s,zz,(.029-i*.002)*s,.010*s,.021*s);}
}
export function chilin(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p,.78,.70);p.tile=k.mat('#606b66',.93);p.wood=k.mat('#76513d',.94);p.pale=k.mat('#c6c7b8',.95);p.gold=lit(k,'#c6a35b',.15);
 const stone=k.mat('#a5ada1',.98),joint=k.mat('#88968b',.98),water=k.mat('#557d6d',.51),bronze=k.mat('#4a5544',.85,.2),leaf=k.mat('#69804c',.96),flower=k.mat('#d3aeb7',.92);stone.userData.chilinWalk=true;p.pale.userData.chilinWalk=true;water.userData.chilinPond=true;
 // The model selects the first lotus courtyard and its paired towers, not the entire monastery.
 k.box(g,1.08,.045,1.04,stone,0,.038,-.005);
 for(let i=0;i<=14;i++)k.box(g,1.04,.0007,.001,joint,0,.0613,-.50+i*.071);
 for(let i=0;i<=15;i++)k.box(g,.001,.0007,1.01,joint,-.51+i*.068,.0613,-.005);
 hall(k,g,p,{z:.422,y:.098,w:.37,d:.17,h:.156,gate:true,label:'山門'});
 for(const s of [-1,1]){
  const side=new THREE.Group();side.position.x=s*.474;side.rotation.y=Math.PI/2;g.add(side);hall(k,side,p,{w:.66,d:.12,h:.105,y:.078,z:0,open:true});
  k.box(g,.011,.107,.68,p.wood,s*.526,.13,0);
  const front=new THREE.Group();front.position.set(s*.351,0,.421);g.add(front);hall(k,front,p,{w:.276,d:.12,h:.10,y:.078,open:true});
  hall(k,g,p,{x:s*.416,z:-.356,y:.135,w:.142,d:.16,h:.143,double:true});
  for(const z of [-.04,.17,.32])bonsai(k,g,p,s*.36,z,z===.32?1.1:.9);
 }
 k.box(g,.65,.071,.287,stone,0,.0965,-.353);
 hall(k,g,p,{z:-.355,y:.143,w:.58,d:.24,h:.185,double:true,label:'天王殿'});
 for(let i=0;i<7;i++){const top=.070+i*.012,z=-.153-i*.012;k.box(g,.20,top-.061,.0127,stone,0,(top+.061)/2,z);}
 for(const s of [-1,1]){stoneRail(k,g,p,[s*.116,-.158],[s*.116,-.236],.14);stoneRail(k,g,p,[s*.126,-.208],[s*.31,-.208],.14);}
 for(const x of [-.17,.17])for(const z of [-.048,.180]){
  // Water sits inside a stone rim. No opaque slab covers the recessed pond.
  k.box(g,.25,.008,.178,water,x,.067,z);
  for(const s of [-1,1]){k.box(g,.274,.018,.013,p.pale,x,.071,z+s*.095);k.box(g,.013,.018,.178,p.pale,x+s*.131,.071,z);stoneRail(k,g,p,[x-.131,z+s*.095],[x+.131,z+s*.095],.080);stoneRail(k,g,p,[x+s*.131,z-.095],[x+s*.131,z+.095],.080);}
  for(let i=0;i<31;i++){
   const a=i*2.399,r=Math.sqrt((i+.5)/31),xx=x+Math.cos(a)*r*.109,zz=z+Math.sin(a)*r*.068;
   const pad=k.mesh(g,new THREE.CircleGeometry(.010+(i%3)*.002,14,0,TAU*.94),leaf,xx,.073,zz);pad.rotation.x=-Math.PI/2;pad.rotation.z=a;
   if(i%7===0){for(let j=0;j<5;j++){const t=j/5*TAU;ellipsoid(k,g,flower,xx+Math.cos(t)*.0033,.075,zz+Math.sin(t)*.0033,.0034,.0018,.0034);}k.ball(g,.0018,p.gold,xx,.078,zz);}
  }
 }
 // Bronze courtyard lamp and its stone foot stay off the main walking axis.
 k.cyl(g,.019,.024,.016,p.pale,.338,.070,.065,12);k.cyl(g,.006,.010,.072,bronze,.338,.113,.065,10);k.cyl(g,.020,.009,.017,bronze,.338,.151,.065,12);k.cyl(g,.026,.004,.016,bronze,.338,.164,.065,12);k.ball(g,.006,p.gold,.338,.178,.065);
 // Front approach, open gate and interior are a single uninterrupted walking route.
 for(let i=0;i<8;i++){const z=.610-i*.0125,top=-.005+i*.0147,bottom=siteHeight(0,z-.0063,.78,.70)+.001;k.box(g,.184,top-bottom,.013,stone,0,(top+bottom)/2,z);}
 k.box(g,.187,.037,.116,stone,0,.0795,.464);
 for(let i=0;i<3;i++){const z=.318-i*.013,top=.098-i*.0147;k.box(g,.185,top-.061,.0136,stone,0,(top+.061)/2,z);}
 skin(k,g,(u,v)=>{const x=(u-.5)*.184,z=.616+v*.035;return [x,THREE.MathUtils.lerp(-.005,siteHeight(x,z,.78,.70)+.003,v),z];},10,12,stone);
 sign(k,g,'志蓮淨苑',.17,.025,0,.310,-.189,{background:'#39382f',color:'#d6bd7f'});
 return finish(k,g,{lamps:[[-.29,.064,.30],[.29,.064,.30],[-.28,.145,-.20],[.28,.145,-.20]],visitors:[[-.027,.10,.415],[.02,.063,.29],[.01,.063,.12],[.30,.063,.27]]});
}
