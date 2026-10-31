import * as THREE from 'three';
import {tree,plaque} from './wuhan-architecture.js';
import {people,bollards,glow} from './shenzhen-forms.js';
import {palette,footing,lattice,balcony,lantern,moonWall} from './shunde-kit.js';

// A compressed composition of the old garden, not a surveyed visitor map.
// The boat hall, shell-window pavilion and bamboo moon screen follow museum photographs.
function tiledRoof(k,g,p,{x=0,z=0,w=.4,d=.26,y=.2,h=.075}={}){
  const vertices=[],indices=[],nx=36,nz=24;
  const at=(u,v)=>{const edge=Math.abs(v*2-1);return [x+(u-.5)*w,y+h*(1-edge)**1.35+.012*edge**6*(Math.abs(u*2-1)**7),z+(v-.5)*d];};
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)vertices.push(...at(i/nx,j/nz));
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;indices.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();p.tile.side=THREE.DoubleSide;k.mesh(g,geo,p.tile);
  for(let i=0;i<=nx;i++){const q=Array.from({length:17},(_,j)=>{const a=at(i/nx,j/16);a[1]+=.0015;return a;});k.line(g,q,.0013,i%3===0?p.tileEdge:p.tile);}
  for(const u of [0,1]){const q=Array.from({length:25},(_,j)=>at(u,j/24));k.line(g,q,.004,p.tileEdge);}
  for(const v of [0,1])k.line(g,Array.from({length:13},(_,j)=>at(j/12,v)),.003,p.tileEdge);
  k.line(g,[[x-w/2,y+h+.009,z],[x-w*.25,y+h+.004,z],[x+w*.25,y+h+.004,z],[x+w/2,y+h+.009,z]],.004,p.tileEdge);
  // End boards close the gables rather than leaving a hole beneath the ridge.
  for(const side of [-1,1]){const s=new THREE.Shape();s.moveTo(-d/2,0);for(let j=0;j<=24;j++){const v=j/24;s.lineTo((v-.5)*d,at(side<0?0:1,v)[1]-y);}s.lineTo(d/2,0);s.closePath();const end=k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.004,bevelEnabled:false}),p.wood,x+side*w/2,y,z);end.rotation.y=Math.PI/2;}
}
function windows(k,g,p,x,y,z,w,h,columns=4,colored=false){
  k.box(g,w,.007,.008,p.wood,x,y-h/2,z);k.box(g,w,.007,.008,p.wood,x,y+h/2,z);
  for(let i=0;i<columns;i++){
    const xx=x+(i/(columns-1)-.5)*(w-w/columns),ww=w/columns*.85;
    k.box(g,ww,h,.003,p.glass,xx,y,z-.002);lattice(k,g,xx,y,z+.002,ww,h,p.red);
    for(let row=0;row<3;row++)for(let col=0;col<2;col++){
      const cx=xx+(col-.5)*ww*.43,cy=y+(row-1)*h*.28;
      k.line(g,[[cx,cy+h*.095,z+.006],[cx+ww*.14,cy,z+.006],[cx,cy-h*.095,z+.006],[cx-ww*.14,cy,z+.006]],.0011,p.ivory,true);
      if(colored&&row===1)k.box(g,ww*.17,h*.10,.001,p.panes[(i+col)%p.panes.length],cx,cy,z+.003);
    }
  }
}
function fretRail(k,g,p,x,y,z,w){
  k.box(g,w,.004,.005,p.wood,x,y+.041,z);k.box(g,w,.004,.005,p.wood,x,y+.004,z);
  const n=Math.round(w/.035);for(let i=0;i<=n;i++)k.box(g,.003,.04,.006,p.wood,x+(i/n-.5)*w,y+.021,z);
  for(let i=0;i<n;i++){const xx=x+((i+.5)/n-.5)*w;k.line(g,[[xx-.012,y+.022,z],[xx,y+.037,z],[xx+.012,y+.022,z],[xx,y+.007,z]],.0018,p.red,true);}
}
function corridor(k,g,p,{x=0,z=0,w=.5,y=.03,rotation=0}={}){
  const c=new THREE.Group();k.box(c,w,.012,.092,p.stone,0,y-.006,0);
  for(let i=0;i<=Math.ceil(w/.07);i++){const xx=(i/Math.ceil(w/.07)-.5)*w;for(const side of [-1,1])k.cyl(c,.003,.004,.12,p.red,xx,y+.060,side*.035,8);}
  tiledRoof(k,c,p,{w:w+.04,d:.14,y:y+.12,h:.037});balcony(k,c,0,.040,w,y,p.wood);
  for(let i=0;i<Math.ceil(w/.035);i++)k.box(c,.001,.001,.078,p.grout,(i/Math.ceil(w/.035)-.5)*w,y+.001,0);
  k.box(c,w,.002,.002,p.warm,0,y+.115,.050);c.position.set(x,0,z);c.rotation.y=rotation;g.add(c);
}
export function qinghui(k){
  const g=new THREE.Group(),p=palette(k);
  p.wall.color.set('#c9c5ad');p.tile.color.set('#5b6053');p.wood.color.set('#303e35');p.red.color.set('#835044');p.brick.color.set('#6b7469');p.water.color.set('#557b66');p.water.roughness=.66;p.water.metalness=.02;p.water.userData.preserveSmooth=true;
  p.water.onBeforeCompile=s=>{s.vertexShader='varying vec2 gardenWater;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngardenWater=position.xz;');s.fragmentShader='varying vec2 gardenWater;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat ripple=sin(gardenWater.x*760.0+sin(gardenWater.y*320.0)*1.4)*sin(gardenWater.y*510.0);diffuseColor.rgb*=.97+.03*ripple;');};p.water.customProgramCacheKey=()=> 'qinghui-still-water-1';
  p.tileEdge=k.mat('#807860',.89);p.ivory=k.mat('#bebda2');p.grout=k.mat('#8e9280');p.glass=k.mat('#748578',.47,.1,'#f0cb89');p.glass.userData.night.intensity=.28;
  p.panes=['#577c6f','#935250','#aba05d'].map(c=>k.mat(c,.48,.1,c));p.panes.forEach(m=>m.userData.night.intensity=.25);
  p.warm=glow(k,'#e4bb7e',.65);const stoneDark=k.mat('#929886',.94),leaf=k.mat('#5e8057',.9),lotus=k.mat('#beada3',.88);
  p.stone.userData.qinghuiPaving=true;footing(k,g,1.24,1.16,p);
  // Low garden boundary keeps the pond and timber architecture visible.
  for(const x of [-.60,.60]){k.box(g,.018,.085,1.12,p.wall,x,.058,0);k.box(g,.026,.009,1.13,p.tileEdge,x,.103,0);}
  k.box(g,1.20,.085,.018,p.wall,0,.058,-.56);
  for(const x of [-.36,.36])k.box(g,.48,.085,.018,p.wall,x,.058,.56);
  // A square lotus pond is the foreground void; all supports are deliberately inside its banks.
  const pool={x:.105,z:.155,w:.75,d:.57,y:.025};k.box(g,pool.w,.005,pool.d,p.water,pool.x,pool.y-.0025,pool.z);
  for(const side of [-1,1]){k.box(g,pool.w+.025,.015,.014,p.stone,pool.x,.027,pool.z+side*pool.d/2);k.box(g,.014,.015,pool.d,p.stone,pool.x+side*pool.w/2,.027,pool.z);}
  // Broad walk behind the garden entrance; tile joints are recessed in the paving.
  k.box(g,1.08,.007,.070,p.stone,0,.020,.492);k.box(g,.09,.007,.88,p.stone,-.54,.020,0);
  for(let i=0;i<25;i++)k.box(g,.001,.001,.065,p.grout,-.52+i*.043,.024,.492);
  for(let i=0;i<22;i++)k.box(g,.08,.001,.001,p.grout,-.54,.024,-.43+i*.041);
  // Double-storey dry boat hall: grey brick below, rose timber windows above,
  // stepped prow and a real open upper landing connecting to the side gallery.
  const boat=new THREE.Group();boat.position.set(.08,0,-.323);g.add(boat);
  k.box(boat,.58,.025,.235,p.stone,0,.030,0);k.box(boat,.53,.137,.175,p.brick,0,.111,-.014);
  k.box(boat,.59,.014,.255,p.wood,0,.185,.014);k.box(boat,.55,.14,.183,p.wood,0,.265,-.014);
  for(let i=0;i<4;i++){
    const xx=-.204+i*.136;k.box(boat,.005,.15,.009,p.wood,xx,.113,.095);windows(k,boat,p,xx,.111,.077,.095,.108,2);
    windows(k,boat,p,xx,.267,.082,.118,.104,3,true);k.box(boat,.118,.026,.009,p.red,xx,.205,.086);
  }
  for(let row=0;row<8;row++)k.box(boat,.53,.001,.001,p.grout,0,.051+row*.016,-.104);
  for(const sign of [-1,1]){const end=new THREE.Group();windows(k,end,p,0,.267,0,.15,.104,3,true);end.position.set(sign*.278,0,-.014);end.rotation.y=sign*Math.PI/2;boat.add(end);}
  // Balcony extends beyond the cabin at the left prow.
  k.box(boat,.75,.013,.105,p.wood,-.085,.181,.105);fretRail(k,boat,p,-.085,.189,.154,.75);
  const sideRail=new THREE.Group();fretRail(k,sideRail,p,0,.189,0,.19);sideRail.rotation.y=Math.PI/2;sideRail.position.set(-.463,0,.060);boat.add(sideRail);
  tiledRoof(k,boat,p,{w:.64,d:.275,y:.343,h:.070});
  for(const x of [-.22,0,.22])lantern(k,boat,x,.333,.117,p,.006);
  plaque(k,boat,'船厅',.071,.025,0,.322,.095);
  // Back gallery and side pavilion meet the upper prow through an elevated bridge.
  const upper=new THREE.Group();upper.position.set(-.39,0,-.324);g.add(upper);
  k.box(upper,.15,.156,.20,p.brick,0,.102,0);k.box(upper,.17,.012,.22,p.stone,0,.186,0);
  for(const x of [-.064,.064])for(const z of [-.075,.075])k.cyl(upper,.003,.004,.11,p.red,x,.245,z,8);
  tiledRoof(k,upper,p,{w:.20,d:.25,y:.30,h:.045});
  corridor(k,g,p,{x:.18,z:-.505,w:.69});
  // Bixi Cottage uses a true pierced circular bamboo screen, not a circle painted on a wall.
  const bixi=new THREE.Group();bixi.position.set(-.424,0,.042);bixi.rotation.y=Math.PI/2;g.add(bixi);
  k.box(bixi,.265,.014,.205,p.stone,0,.029,0);k.box(bixi,.24,.145,.014,p.brick,0,.109,-.082);
  for(const x of [-.118,.118])k.box(bixi,.013,.145,.175,p.brick,x,.109,0);
  moonWall(k,bixi,{...p,wall:p.wood,stone:p.wood},{x:0,z:.088,y:.036,w:.24,h:.145,r:.055});
  for(let i=0;i<5;i++){const x=(i-2)*.016,h=Math.sqrt(.05**2-x*x);k.beam(bixi,[x,.099-h,.098],[x+.005,.099+h,.098],.0013,p.green,5);for(const side of [-1,1])k.beam(bixi,[x,.11,.099],[x+side*.010,.12,.099],.0018,p.green,5);}
  tiledRoof(k,bixi,p,{w:.29,d:.24,y:.190,h:.047});plaque(k,bixi,'碧溪草堂',.12,.024,0,.171,.099);
  // Chengyi Pavilion is carried by visible piers over the pool. The shell windows
  // leave a dark central opening and a continuous handrail.
  const pavilion=new THREE.Group();pavilion.position.set(.408,0,.130);pavilion.rotation.y=-Math.PI/2;g.add(pavilion);
  for(const x of [-.087,.087])for(const z of [-.058,.058])k.box(pavilion,.017,.032,.019,p.brick,x,.035,z);
  k.box(pavilion,.24,.012,.19,p.wood,0,.057,.008);
  for(const x of [-.090,.090])for(const z of [-.055,.055])k.cyl(pavilion,.004,.004,.125,p.wood,x,.125,z,8);
  k.box(pavilion,.19,.115,.009,p.brick,0,.12,-.065);
  for(const x of [-.069,.069])windows(k,pavilion,{...p,glass:p.ivory},x,.126,.061,.042,.095,2);
  tiledRoof(k,pavilion,p,{w:.28,d:.23,y:.189,h:.050});fretRail(k,pavilion,p,0,.065,.098,.24);
  for(const x of [-.112,.112])lantern(k,pavilion,x,.184,.093,p,.006);
  // Six-sided waterside pavilion, distinctly lower than the boat hall.
  const hex=new THREE.Group();hex.position.set(-.172,0,.362);g.add(hex);
  k.cyl(hex,.094,.10,.021,p.stone,0,.028,0,6);
  for(let i=0;i<6;i++){const a=i*Math.PI/3; k.cyl(hex,.003,.004,.11,p.wood,Math.cos(a)*.073,.09,Math.sin(a)*.073,8);}
  const hv=[],hi=[];for(let ring=0;ring<=14;ring++)for(let i=0;i<=60;i++){const a=i/60*Math.PI*2,r=ring/14,local=((a+Math.PI/6)%(Math.PI/3))-Math.PI/6,rr=.10*r*Math.cos(Math.PI/6)/Math.cos(local);hv.push(Math.cos(a)*rr,.146+.06*(1-r)**1.3,Math.sin(a)*rr);}
  for(let j=0;j<14;j++)for(let i=0;i<60;i++){const a=j*61+i,b=a+61;hi.push(a,b,a+1,a+1,b,b+1);}const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hv,3));hg.setIndex(hi);hg.computeVertexNormals();k.mesh(hex,hg,p.tile);k.ball(hex,.006,p.tileEdge,0,.210,0);
  for(let i=0;i<6;i++){const a=i*Math.PI/3; k.line(hex,Array.from({length:9},(_,j)=>{const t=j/8;return [Math.cos(a)*.087*t,.146+.06*(1-t)**1.3,Math.sin(a)*.087*t];}),.002,p.tileEdge);}
  corridor(k,g,p,{x:.543,z:-.019,w:.44,rotation:Math.PI/2});
  // Low bank rocks, lotus leaves and a shaded side court; keep the central view open.
  for(let i=0;i<18;i++){const a=i*2.399,x=-.38+Math.cos(a)*.077,z=.28+Math.sin(a)*.105,s=.015+(i%4)*.006;const rock=k.mesh(g,new THREE.IcosahedronGeometry(s,1),stoneDark,x,.026+s*.6,z);rock.scale.set(1.2,.8,1);}
  for(let i=0;i<32;i++){const x=-.22+(i%8)*.032+.009*Math.sin(i),z=.06+Math.floor(i/8)*.048;if(x>-.08&&z>.13)continue;const pad=k.cyl(g,.012,.012,.0012,leaf,x,.029,z,14);pad.scale.z=.8;if(i%7===0){k.beam(g,[x,.030,z],[x,.046,z],.0009,p.green,5);for(let j=0;j<5;j++){const a=j*1.257,m=k.ball(g,.004,lotus,x+Math.cos(a)*.003,.047,z+Math.sin(a)*.003);m.scale.set(1,.65,1);}}}
  for(const [x,z,s]of [[-.43,-.15,.24],[-.49,.26,.13],[.42,-.42,.14],[.52,.40,.12],[-.44,-.48,.10],[-.04,-.49,.10]])tree(k,g,x,.023,z,s);
  for(let i=0;i<15;i++){const x=-.49+(i%3)*.022,z=.16+Math.floor(i/3)*.023,h=.115+.025*Math.sin(i*.8);k.cyl(g,.0014,.0017,h,p.green,x,.023+h/2,z,5);for(let j=0;j<3;j++)k.beam(g,[x,.07+j*.02,z],[x+.012*Math.cos(i+j),.085+j*.02,z+.019*Math.sin(i+j)],.003,leaf,4);}
  people(k,g,[[-.10,.49],[.01,.50],[.26,.49],[-.54,.10],[-.54,-.09]]);bollards(k,g,[[-.53,.47],[.51,.48],[-.53,-.46],[.52,-.45]]);
  g.userData={pool,boat:{x:.08,z:-.323,roofY:.413},pavilion:{x:.408,z:.130,deckY:.063},bixi:{x:-.424,z:.042,screenY:.099},pavingSamples:[[-.54,.02,.1],[0,.023,.492]]};
  k.merge(g);
  for(const [x,y,z,intensity]of [[.08,.30,-.14,.006],[.31,.18,.13,.004],[-.35,.17,.06,.003]]){const l=new THREE.PointLight('#efce99',0,.55,2);l.position.set(x,y,z);l.userData.nightIntensity=intensity;g.add(l);}
  return g;
}
