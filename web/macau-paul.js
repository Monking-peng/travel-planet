import * as THREE from 'three';
import {palette,site,steps,extrude,archPath,finish} from './macau-kit.js';

// Proportions follow the Cultural Affairs Bureau's south elevation, not a
// generic church: 23 m wide, 25.5 m high; only the surviving facade remains.
const SCALE=.0021,BASE=.135,CENTER=396;
const X=x=>(x-CENTER)*SCALE,Y=y=>BASE+(521-y)*SCALE;
function stone(k,color,blocks=false){
 const m=k.mat(color,.97,.015);m.userData.night={color:new THREE.Color('#c6b99c'),intensity:.025};
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 vPaulStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPaulStone=position;');
  s.fragmentShader='varying vec3 vPaulStone;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 p=vPaulStone;float grain=fract(sin(dot(floor(p*1800.),vec3(12.9898,78.233,39.425)))*43758.5453);
   float weather=.5+.5*sin(p.x*37.+sin(p.y*51.))*sin(p.y*17.+p.z*31.);
   diffuseColor.rgb*=.90+.075*grain+.04*weather;
   ${blocks?`float row=floor(p.y/.038);vec2 cell=vec2((p.x+p.z*.6)/.078+mod(row,2.)*.5,p.y/.038);vec2 q=fract(cell);vec2 edge=min(q,1.-q);float seam=1.-smoothstep(.004,.022,min(edge.x,edge.y));float variation=fract(sin(dot(floor(cell),vec2(4.45,17.21)))*135.731);diffuseColor.rgb*=mix(.91,1.055,variation)*(1.-seam*.16);`:''}
  `);
 };m.customProgramCacheKey=()=>`paul-granite-${blocks}`;return m;
}
function rect(x,top,w,bottom){return new THREE.Path([new THREE.Vector2(X(x-w/2),Y(bottom)),new THREE.Vector2(X(x+w/2),Y(bottom)),new THREE.Vector2(X(x+w/2),Y(top)),new THREE.Vector2(X(x-w/2),Y(top))]);}
function path(points){return points.map(([x,y,z=.045])=>[X(x),Y(y),z]);}
function rectFrame(k,g,m,x,top,w,bottom,z=.052,t=3){
 const h=(bottom-top)*SCALE;
 for(const side of [-1,1])k.box(g,t*SCALE,h,.014,m,X(x+side*w/2),Y((top+bottom)/2),z);
 for(const yy of [top,bottom])k.box(g,(w+t)*SCALE,t*SCALE,.018,m,X(x),Y(yy),z);
}
function floral(k,g,m,x,y,r=5,z=.068,n=6){
 for(let j=0;j<n;j++){const a=j/n*Math.PI*2,o=k.ball(g,r*SCALE*.45,m,X(x+Math.sin(a)*r*.65),Y(y+Math.cos(a)*r*.65),z);o.scale.set(.8,1,.48);o.rotation.z=-a;}
 const c=k.ball(g,r*SCALE*.38,m,X(x),Y(y),z+.001);c.scale.z=.6;
}
function shaft(k,g,m,x,top,bottom,r=3.4,order=0){
 const z=.069,low=Y(bottom-7),high=Y(top+10),h=high-low;
 const profile=[[0,r*1.02],[.05,r],[.40,r*.96],[.82,r*.84],[1,r*.82]].map(([y,rr])=>new THREE.Vector2(rr*SCALE,h*y));
 k.mesh(g,new THREE.LatheGeometry(profile,16),m,X(x),low,z);
 for(const [yy,w,hh]of [[bottom-3,13,6],[bottom-7,10,2],[top+8,10,3],[top+3,14,5]])k.box(g,w*SCALE,hh*SCALE,.024,m,X(x),Y(yy),z);
 for(const side of [-1,1]){const o=k.mesh(g,new THREE.TorusGeometry(3*SCALE,1*SCALE,5,16),m,X(x+side*4.8),Y(top+7),z+.012);o.scale.y=.75;}
 if(order)for(const yy of [top+6,top+11])for(const dx of [-4,0,4]){const o=k.ball(g,.0038,m,X(x+dx),Y(yy),z+.009);o.scale.set(.45,1,.35);o.rotation.z=dx*.09;}
}
function figure(k,g,m,x,bottom,height=44,z=.054,pose=0){
 const h=height*SCALE,y=Y(bottom),a=X(x),body=h*.74;
 const profile=[[0,.17],[.1,.18],[.35,.13],[.70,.11],[.89,.16],[1,.12]].map(([v,r])=>new THREE.Vector2(r*h,body*v));
 k.mesh(g,new THREE.LatheGeometry(profile,12),m,a,y,z);
 k.ball(g,h*.087,m,a,y+h*.88,z+.001);
 k.cyl(g,h*.045,h*.06,h*.1,m,a,y+h*.78,z,10);
 for(const side of [-1,1]){
  const handY=y+h*(pose===1?.60:.48)+(side===1?pose*.004:0),handX=a+side*h*(pose===1?.37:.17);
  k.line(g,[[a+side*h*.11,y+h*.69,z],[a+side*h*.23,y+h*.53,z+.006],[handX,handY,z+.012]],h*.040,m);
  k.ball(g,h*.049,m,handX,handY,z+.014);
 }
 for(const dx of [-.09,0,.09])k.line(g,[[a+dx*h,y+.005,z+h*.13],[a+dx*h*.6,y+h*.36,z+h*.12],[a+dx*h*.3,y+h*.61,z+h*.10]],.0012,m);
 if(pose!==1&&pose!==3){const book=k.box(g,h*.21,h*.16,.008,m,a+h*.13,y+h*.53,z+.015);book.rotation.z=-.22;}
 k.box(g,h*.44,.007,.025,m,a,y-.004,z);
}
function scroll(k,g,m,points,z=.058,r=.0035){k.line(g,points.map(([x,y])=>[X(x),Y(y),z]),r,m);}
function spiral(k,g,m,cx,cy,r,side=1,z=.062){
 const points=[];for(let j=0;j<=42;j++){const a=j/42*Math.PI*3.5,rr=r*(1-j/48);points.push([X(cx+side*Math.cos(a)*rr),Y(cy+Math.sin(a)*rr),z]);}k.line(g,points,.0018,m);
}
function cornice(k,g,m,dark,y,w){
 for(const [dy,ww,h,depth,z]of [[0,w,4,.112,.015],[-4,w+4,3,.119,.018],[5,w-3,3,.102,.011],[12,w-9,6,.089,.003]])k.box(g,ww*SCALE,h*SCALE,depth,dy===5?dark:m,0,Y(y+dy),z);
 for(let x=CENTER-w/2+9;x<CENTER+w/2;x+=12)k.box(g,4*SCALE,4*SCALE,.012,m,X(x),Y(y+8),.055);
}
function nicheFrame(k,g,m,x,top,bottom,w,z=.052){
 const a=archPath(X(x),Y(bottom),w*SCALE,(bottom-top)*SCALE);k.line(g,a.getPoints(32).map(v=>[v.x,v.y,z]),.003,m,true);
 for(let j=0;j<7;j++){const angle=Math.PI*j/6;const xx=X(x)+Math.cos(angle)*w*SCALE*.43,yy=Y(top)+w*SCALE*.47+Math.sin(angle)*w*SCALE*.43;k.beam(g,[X(x),Y(top)+w*SCALE*.47,z-.002],[xx,yy,z-.002],.0009,m);}
 rectFrame(k,g,m,x,bottom+2,w+8,bottom+16,z,2);
}
function reliefShip(k,g,m,cx,cy){
 scroll(k,g,m,[[cx-14,cy+6],[cx-8,cy+12],[cx+10,cy+12],[cx+17,cy+4]],.061,.0023);
 for(const dx of [-5,5]){k.beam(g,...path([[cx+dx,cy+8,.062],[cx+dx,cy-17,.062]]),.001,m);const s=new THREE.Shape();s.moveTo(X(cx+dx+1),Y(cy-16));s.lineTo(X(cx+dx+10),Y(cy-5));s.lineTo(X(cx+dx+1),Y(cy-4));s.closePath();extrude(k,g,s,m,.003,.063);}
 for(let j=0;j<3;j++)scroll(k,g,m,[[cx-17,cy+15+j*3],[cx-9,cy+12+j*3],[cx,cy+16+j*3],[cx+11,cy+13+j*3],[cx+19,cy+15+j*3]],.062,.0011);
}

export function paul(k){
 const g=new THREE.Group(),p=palette(k),m=stone(k,'#a1a6a7'),wall=stone(k,'#929a9b',true),shade=stone(k,'#757a76'),bronze=k.mat('#354d49',.88,.22),iron=k.mat('#566465',.82,.32);
 bronze.userData.night={color:new THREE.Color('#7c8978'),intensity:.018};wall.userData.paulFacade=true;
 site(k,g,p);steps(k,g,{stone:m},0,.53,1.08,18,.11,.35);
 // A level arrival terrace supports the facade and reaches the top stair.
 k.box(g,1.095,.11,.53,wall,0,.079,-.055);
 k.box(g,1.12,.010,.55,m,0,.139,-.055);
 const s=new THREE.Shape();s.moveTo(X(166),Y(521));s.lineTo(X(626),Y(521));s.lineTo(X(626),Y(250));s.lineTo(X(615),Y(245));s.bezierCurveTo(X(565),Y(244),X(526),Y(223),X(520),Y(177));s.lineTo(X(520),Y(167));s.bezierCurveTo(X(482),Y(170),X(478),Y(136),X(476),Y(107));s.lineTo(X(396),Y(54));s.lineTo(X(316),Y(107));s.bezierCurveTo(X(314),Y(136),X(310),Y(170),X(272),Y(167));s.lineTo(X(272),Y(177));s.bezierCurveTo(X(266),Y(223),X(227),Y(244),X(177),Y(245));s.lineTo(X(166),Y(250));s.closePath();
 const doors=[[251,46,438],[396,64,424],[542,46,438]];
 for(const [x,w,top]of doors)s.holes.push(rect(x,top,w,520));
 for(const [x,w,top]of [[251,28,302],[396,37,295],[542,28,302]])s.holes.push(archPath(X(x),Y(364),w*SCALE,(364-top)*SCALE));
 for(const x of [192,303,487,596])s.holes.push(archPath(X(x),Y(345),27*SCALE,58*SCALE));
 s.holes.push(archPath(0,Y(235),30*SCALE,56*SCALE));s.holes.push(rect(396,119,26,161));
 extrude(k,g,s,wall,.066,-.008);
 for(const [x,w,top]of doors){rectFrame(k,g,m,x,top-3,w+7,520,.045,4);rectFrame(k,g,shade,x,top+1,w+1,520,.034,1.4);k.box(g,(w+14)*SCALE,6*SCALE,.033,m,X(x),Y(top-8),.048);}
 // Lattice gates are distinct from the stone openings; the central entry is open.
 for(const x of [251,542])for(const slope of [-1,1])for(let j=-9;j<=9;j++){
  const w=44,h=80,top=439,pts=[];for(const t of [0,1]){const yy=top+t*h,xx=x+j*7+slope*(yy-top-h/2)*.20;pts.push([xx,yy]);}
  const [a,b]=pts;const lo=x-w/2,hi=x+w/2;let t0=0,t1=1;const dx=b[0]-a[0];for(const edge of [lo,hi]){const t=(edge-a[0])/dx;if(dx>0){if(edge===lo)t0=Math.max(t0,t);else t1=Math.min(t1,t);}else{if(edge===hi)t0=Math.max(t0,t);else t1=Math.min(t1,t);}}
  if(t1>t0)k.beam(g,...[t0,t1].map(t=>[X(a[0]+(b[0]-a[0])*t),Y(a[1]+(b[1]-a[1])*t),.014]),.00085,iron,4);
 }
 const columns=[177,212,283,326,348,444,468,505,579,611];
 for(const x of columns){shaft(k,g,m,x,389,497,4.9);shaft(k,g,m,x,272,351,4.1,1);rectFrame(k,g,m,x,501,14,518,.058,2);}
 for(const [y,w]of [[523,468],[378,473],[260,466],[178,252],[109,164]])cornice(k,g,m,shade,y,w);
 // Facade windows remain transparent, with carved flowers above their lintels.
 for(const [x,w,top]of [[251,43,294],[396,57,286],[542,43,294]]){
  rectFrame(k,g,m,x,top,w,364,.045,3);k.box(g,(w+9)*SCALE,5*SCALE,.022,m,X(x),Y(top-5),.047);
  for(let j=-3;j<=3;j++)floral(k,g,m,x+j*(w+5)/7,top-11,2.7,.056);
 }
 for(const x of [192,303,487,596]){
  const a=archPath(X(x),Y(345),27*SCALE,58*SCALE);extrude(k,g,new THREE.Shape(a.getPoints(36)),shade,.006,-.041);nicheFrame(k,g,m,x,287,345,27);
  figure(k,g,bronze,x,343,43,.011,x<396?0:2);
 }
 // Base panels and the actual central inscription; no luminous signboards.
 for(const x of [192,303,487,596]){rectFrame(k,g,m,x,395,24,489,.043,2);for(let j=0;j<3;j++)scroll(k,g,m,[[x,400+j*27],[x+8,412+j*27],[x,424+j*27],[x-8,412+j*27],[x,400+j*27]],.048,.0015);}
 for(const x of [251,542]){rectFrame(k,g,m,x,398,48,429,.047,2);for(let j=0;j<16;j++){const a=j/16*Math.PI*2;k.beam(g,[X(x+Math.cos(a)*8),Y(413+Math.sin(a)*8),.052],[X(x+Math.cos(a)*13),Y(413+Math.sin(a)*13),.052],.0008,m);}floral(k,g,m,x,413,7,.055,8);}
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=512;c.height=64;const ctx=c.getContext('2d');ctx.clearRect(0,0,512,64);ctx.font='bold 44px Georgia';ctx.fillStyle='#565b53';ctx.textAlign='center';ctx.fillText('MATER DEI',256,48);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const text=k.mat('#ffffff',1,0);text.map=texture;text.transparent=true;k.mesh(g,new THREE.PlaneGeometry(.138,.017),text,0,Y(410),.059);
 }
 // Third tier: recessed central statue, relief panels, volutes and pinnacles.
 const mary=archPath(0,Y(235),30*SCALE,56*SCALE);extrude(k,g,new THREE.Shape(mary.getPoints(36)),shade,.006,-.041);nicheFrame(k,g,m,396,179,235,30,.051);figure(k,g,bronze,396,233,43,.010,3);
 for(const x of [282,319,349,443,473,510])shaft(k,g,m,x,185,242,2.6,1);
 for(const side of [-1,1]){
  const mirror=x=>396+side*(x-396);
  const shoulder=[[176,241],[208,238],[239,224],[257,205],[273,188]];scroll(k,g,m,shoulder.map(([x,y])=>[mirror(x),y]),.041,.004);
  spiral(k,g,m,mirror(215),223,12,side);scroll(k,g,m,[[mirror(228),231],[mirror(239),226],[mirror(242),216],[mirror(255),225]],.054,.002);
  for(const [xx,yy,hh]of [[175,240,67],[211,237,66],[239,226,42],[278,167,42]]){
   const x=mirror(xx);k.box(g,9*SCALE,5*SCALE,.025,m,X(x),Y(yy),.018);k.cyl(g,.002,5*SCALE,hh*SCALE,m,X(x),Y(yy-hh/2),.018,4);k.ball(g,.004,m,X(x),Y(yy-hh-2),.018);
  }
  // Chinese lion waterspouts at the ends; keep them projecting beyond the wall.
  const xx=mirror(171);k.box(g,.026,.012,.036,m,X(xx),Y(238),.050);const head=k.ball(g,.009,m,X(xx),Y(235),.077);head.scale.set(1,.85,1.15);for(const dx of [-.006,.006])k.ball(g,.003,m,X(xx)+dx,Y(230),.076);
  for(const x of [mirror(334),mirror(458)])rectFrame(k,g,m,x,190,21,238,.042,1.5);
 }
 reliefShip(k,g,m,301,214);
 // Selected shallow narrative silhouettes, not detailed reproductions of icons.
 scroll(k,g,m,[[482,225],[490,232],[502,224],[494,219],[500,208],[490,201]],.057,.0025);
 for(let j=0;j<5;j++)scroll(k,g,m,[[488,220],[482+j*4,207-j%2*6],[479+j*5,201-j%2*5]],.061,.0015);
 for(const x of [333,458]){floral(k,g,m,x,202,6,.058);scroll(k,g,m,[[x,207],[x-5,218],[x+5,231]],.055,.002);}
 for(const side of [-1,1])for(let j=0;j<4;j++)floral(k,g,m,396+side*22,191+j*13,3,.059);
 // Fourth tier and triangular fifth tier, with the seventh bronze motif (dove).
 for(const x of [327,363,429,465])shaft(k,g,m,x,116,165,2.7,1);
 k.box(g,27*SCALE,43*SCALE,.006,shade,0,Y(140),-.041);figure(k,g,bronze,396,160,37,.006,1);
 for(const x of [342,449]){rectFrame(k,g,m,x,117,24,156,.043,1.8);scroll(k,g,m,[[x-5,145],[x,125],[x+6,145],[x,150],[x-5,145]],.052,.0016);floral(k,g,m,x,126,4,.056);}
 for(const side of [-1,1]){scroll(k,g,m,[[396+side*122,165],[396+side*95,155],[396+side*82,110]],.040,.004);k.beam(g,...path([[396+side*80,106,.048],[396,54,.048]]),.005,m);for(const [xx,yy]of [[326,98],[352,80]]){k.cyl(g,.0017,.004,23*SCALE,m,X(396+side*(xx-396)),Y(yy-11),.011,8);k.ball(g,.003,m,X(396+side*(xx-396)),Y(yy-24),.011);}}
 for(const x of [367,425])floral(k,g,m,x,91,6,.051,8);
 const doveY=Y(86);const body=k.ball(g,.008,bronze,0,doveY,.052);body.scale.set(.6,1.1,.5);for(const side of [-1,1])for(let j=0;j<4;j++)k.line(g,[[side*.002,doveY,.052],[side*(.010+j*.002),doveY+.007+j*.001,.052],[side*(.022-j*.002),doveY+.018-j*.002,.052]],.0018,bronze);k.ball(g,.004,bronze,0,doveY+.010,.053);
 k.box(g,.009,.014,.023,m,0,Y(49),.010);k.box(g,.005,.065,.008,shade,0,Y(28),.012);k.box(g,.036,.005,.008,shade,0,Y(19),.012);
 // Behind the surviving screen: masonry remnants and discreet access platform.
 for(const x of [-.43,.43]){const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.29,0);shape.lineTo(.23,.08);shape.lineTo(.08,.11);shape.lineTo(0,.21);shape.closePath();const buttress=extrude(k,g,shape,wall,.043,0);buttress.rotation.y=Math.PI/2;buttress.position.set(x,.145,-.041);k.box(g,.035,.025,.33,shade,x,.153,-.25);}
 for(const side of [-1,1]){k.beam(g,[side*.39,.145,-.28],[side*.39,.66,-.082],.004,iron);k.beam(g,[side*.39,.66,-.082],[side*.39,.66,-.14],.003,iron);}
 k.box(g,.83,.008,.058,iron,0,.645,-.105);for(let i=-10;i<=10;i++)k.beam(g,[i*.038,.65,-.135],[i*.038,.69,-.135],.0012,iron);k.beam(g,[-.4,.69,-.135],[.4,.69,-.135],.0015,iron);
 const model=finish(k,g,{lamps:[[-.56,.15,.09],[.56,.15,.09]],visitors:[[-.25,.146,.12],[.22,.146,.15],[.07,.027,.53]]});
 for(const x of [-.34,.34]){const light=new THREE.SpotLight('#ffe7bc',0,1.5,.68,.65,2);light.position.set(x,.16,.27);light.target.position.set(x*.60,.76,.016);light.userData.nightIntensity=.12;model.add(light,light.target);}
 const wash=new THREE.SpotLight('#fff0d8',0,2.2,.65,.5,2);wash.position.set(0,.72,1);wash.target.position.set(0,.70,0);wash.userData.nightIntensity=2.2;model.add(wash,wash.target);
 return model;
}
