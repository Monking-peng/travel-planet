import * as THREE from 'three';
import {palette,site,paving,grove,finish,gable,lit,TAU} from './tianjin-kit.js';
function arch(w,h,Path=THREE.Shape){const s=new Path();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);s.closePath();return s;}
function offset(path,x,y){for(const c of path.curves){for(const key of ['v0','v1','v2','v3'])if(c[key]?.isVector2)c[key].add(new THREE.Vector2(x,y));if(c.isEllipseCurve){c.aX+=x;c.aY+=y;}}return path;}
function wall(k,g,p,w,h,holes=[]){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();for(const o of holes)s.holes.push(offset(arch(o.w,o.h,THREE.Path),o.x,o.y));return k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.016,bevelEnabled:false,curveSegments:20}),p.brick,0,0,-.016);}
function frame(k,g,p,x,y,w,h,{shutter=false,blind=false,glass=p.glass}={}){
 const s=arch(w+.009,h+.006);s.holes.push(offset(arch(w,h,THREE.Path),0,.002));k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.007,bevelEnabled:false,curveSegments:20}),p.trim,x,y-.002,.001);
 k.mesh(g,new THREE.ShapeGeometry(arch(w,h),20),blind?p.brick:shutter?p.shutter:glass,x,y,-.009);
 if(blind)return;
 k.box(g,w+.013,.004,.020,p.trim,x,y-.002,0);
 if(shutter){for(let i=1;i<(h-w*.5)/.005;i++)k.box(g,w-.003,.0012,.003,p.slats,x,y+i*.005,-.005);}
 else{for(let i=1;i<5;i++){const yy=y+(h-w*.5)*i/5;k.box(g,w,.0014,.003,p.trim,x,yy,-.003);for(const side of [-1,1])k.mesh(g,new THREE.CircleGeometry(w*.16,6),p.tint[i%3],x+side*w*.21,yy-.010,-.005);}k.box(g,.0015,h-w*.5,.003,p.trim,x,y+(h-w*.5)/2,-.003);}
}
function archBands(k,g,p,x,y,w,h,n=3){for(let j=0;j<n;j++){const rr=w/2+.004+j*.004,zz=.012+j*.003,sy=y+h-w/2;k.line(g,Array.from({length:49},(_,i)=>[x+Math.cos(i/48*Math.PI)*rr,sy+Math.sin(i/48*Math.PI)*rr,zz]),.0019,p.trim);for(const side of [-1,1]){k.cyl(g,.0028,.0038,h-w/2,p.trim,x+side*rr,y+(h-w/2)/2,zz,10);k.box(g,.010,.005,.017,p.trim,x+side*rr,sy-.002,zz);}}}
function door(k,g,p,x,w,h){const y=.055;archBands(k,g,p,x,y,w,h,4);k.mesh(g,new THREE.ShapeGeometry(arch(w,h),24),p.door,x,y,-.010);const shaft=h-w/2;
 for(const side of [-1,1]){k.box(g,w*.43,shaft*.84,.005,p.shutter,x+side*w*.235,y+shaft*.42,-.006);for(let row=0;row<3;row++){const cy=y+shaft*(.16+row*.27);k.box(g,w*.32,shaft*.19,.002,p.door,x+side*w*.235,cy,-.003);k.mesh(g,new THREE.TorusGeometry(w*.085,.0013,5,24),p.trim,x+side*w*.235,cy,-.001);}}
 k.box(g,w+.007,.006,.023,p.trim,x,y+shaft*.87,.009);cross(k,g,p,x,y+shaft+w*.19,.012,w*.28);
}
function cross(k,g,p,x,y,z,size=.045){k.box(g,.004,size,.004,p.bronze,x,y,z);k.box(g,size*.55,.004,.004,p.bronze,x,y+size*.12,z);}
function triangle(k,g,p,w,h,y){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.016,bevelEnabled:false}),p.brick,0,y,-.012);for(let j=0;j<3;j++){const d=j*.006;k.line(g,[[-w/2-d,y-d,.008],[0,y+h+d*.5,.008],[w/2+d,y-d,.008]],.0024,p.trim);}}
function arcade(k,g,p,w,y,n){for(let i=0;i<n;i++){const x=((i+.5)/n-.5)*w;frame(k,g,p,x,y,w/n*.70,.029,{blind:true});k.cyl(g,.002,.003,.025,p.trim,x-w/n*.48,y+.012,.014,8);k.box(g,.008,.004,.015,p.trim,x-w/n*.48,y+.027,.014);}k.box(g,w+.010,.004,.024,p.trim,0,y-.004,.009);}
function quatrefoil(k,g,p,x,y,r){for(let i=0;i<4;i++){const a=i*TAU/4,xx=x+Math.sin(a)*r*.58,yy=y+Math.cos(a)*r*.58;k.mesh(g,new THREE.CircleGeometry(r*.57,32),p.glass,xx,yy,.002);k.mesh(g,new THREE.TorusGeometry(r*.63,.0019,5,40),p.trim,xx,yy,.005);}k.mesh(g,new THREE.CircleGeometry(r*.50,24),p.glass,x,y,.006);}
function dome(k,g,p,x,z,y,r,h){const profile=[[1,0],[1.025,.14],[1.015,.30],[.94,.51],[.79,.72],[.55,.89],[.18,1]],pts=profile.map(([a,b])=>new THREE.Vector2(r*a,h*b));k.mesh(g,new THREE.LatheGeometry(pts,72),p.copper,x,y,z);
 function radius(t){for(let j=1;j<profile.length;j++){if(t<=profile[j][1]){const a=profile[j-1],b=profile[j],f=(t-a[1])/(b[1]-a[1]);return r*(a[0]+(b[0]-a[0])*f);}}return r*.18;}
 for(let row=1;row<16;row++){const t=row/16,rr=radius(t)+.0004;k.line(g,Array.from({length:73},(_,i)=>[x+Math.sin(i/72*TAU)*rr,y+h*t,z+Math.cos(i/72*TAU)*rr]),.0006,p.seam);for(let col=0;col<32;col++){const a=(col+(row%2)*.5)/32*TAU,lo=(row-1)/16; k.beam(g,[x+Math.sin(a)*(radius(lo)+.0003),y+h*lo,z+Math.cos(a)*(radius(lo)+.0003)],[x+Math.sin(a)*rr,y+h*t,z+Math.cos(a)*rr],.00055,p.seam,4);}}
 k.cyl(g,r*1.10,r*1.10,.008,p.trim,x,y-.006,z,72);k.cyl(g,r*.19,r*.23,.009,p.bronze,x,y+h+.004,z,24);cross(k,g,p,x,y+h+.037,z,.056);
 for(let i=0;i<16;i++){const a=i/16*TAU;k.beam(g,[x+Math.sin(a)*r,y-.007,z+Math.cos(a)*r],[x+Math.sin(a)*r*1.17,y+.008,z+Math.cos(a)*r*1.17],.0015,p.bronze);const o=k.box(g,.006,.006,.009,p.lamp,x+Math.sin(a)*r*1.17,y+.011,z+Math.cos(a)*r*1.17);o.rotation.y=a;}
}
function tower(k,g,p,x){const t=new THREE.Group();t.position.set(x,0,.27);g.add(t);const w=.18;
 for(let i=0;i<4;i++){const a=i*TAU/4,f=new THREE.Group();f.position.set(Math.sin(a)*w/2,0,Math.cos(a)*w/2);f.rotation.y=a;t.add(f);const holes=[...[-.034,.034].map(xx=>({x:xx,y:.235,w:.036,h:.170})),...[-.039,0,.039].map(xx=>({x:xx,y:.625,w:.029,h:.115}))];if(i===0)holes.push({x:0,y:.055,w:.085,h:.125});else holes.push({x:0,y:.075,w:.045,h:.095});wall(k,f,p,w,.785,holes);
  for(const o of holes){if(i===0&&o.y===.055)door(k,f,p,0,o.w,o.h);else frame(k,f,p,o.x,o.y,o.w,o.h,{shutter:o.y>.60});}
  quatrefoil(k,f,p,0,.468,.018);arcade(k,f,p,w,.538,6);
  // Cream tympanum and columns frame the three recessed belfry lancets.
  const crown=arch(.132,.157);for(const xx of [-.039,0,.039])crown.holes.push(offset(arch(.029,.115,THREE.Path),xx,.005));k.mesh(f,new THREE.ExtrudeGeometry(crown,{depth:.006,bevelEnabled:false,curveSegments:20}),p.trim,0,.620,-.001);archBands(k,f,p,0,.620,.132,.157,2);k.mesh(f,new THREE.TorusGeometry(.010,.0017,6,40),p.trim,0,.760,.012);
  for(const y of [.573,.608,.783])k.box(f,w+.014,.005,.028,p.trim,0,y,.005);
  for(const side of [-1,1]){k.box(f,.014,.60,.011,p.brick,side*(w/2-.009),.355,.005);k.box(f,.018,.010,.021,p.trim,side*(w/2-.009),.607,.010);}
  triangle(k,f,p,w+.005,.057,.785);
 }
 dome(k,t,p,0,0,.821,.086,.143);
}
export function xikai(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.65,.64);paving(k,g,p,.53,.54);
 p.trim=lit(k,'#c5b697',.11);p.brick=k.mat('#c1a27f',.97);p.brick.userData.xikaiWall=true;p.door=k.mat('#5b332b',.95);p.shutter=k.mat('#79503b',.92);p.slats=k.mat('#ac8059',.91);p.glass=lit(k,'#3a4c54',.085);p.tint=['#69768b','#99774d','#827078'].map(c=>lit(k,c,.065));p.bronze=lit(k,'#615949',.08);p.copper=lit(k,'#6e9b83',.22,'#6eb895');p.seam=k.mat('#587a69',.94);p.lamp=lit(k,'#c2c5aa',.7,'#b7e0c6');p.tile=k.mat('#6b6254',.97);p.red=k.mat('#82715c',.96);
 p.brick.onBeforeCompile=s=>{s.vertexShader='varying vec3 vXikai;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvXikai=position;');s.fragmentShader='varying vec3 vXikai;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float band=step(.5,fract((vXikai.y-.055)/.046));
 vec3 brickTone=mix(vec3(.98,.88,.68),vec3(.76,.39,.22),band);
 float row=floor(vXikai.y/.006);vec2 f=fract(vec2((vXikai.x+vXikai.z)/.018+mod(row,2.)*.5,vXikai.y/.006));
 float joint=step(.07,min(f.x,f.y));diffuseColor.rgb*=mix(brickTone*.75,brickTone,joint)*1.17;`);};p.brick.customProgramCacheKey=()=> 'xikai-stripe-masonry-237';
 // Long nave and lower side aisles continue behind the three-tower facade.
 const floor=.055;k.box(g,.64,.020,.83,p.stone,0,floor-.010,-.065);p.stone.userData.xikaiPaving=true;k.box(g,.654,.020,.10,p.stone,0,floor-.010,.389);
 for(const side of [-1,1]){for(const [x,w,h]of [[.145,.64,.425],[.26,.64,.285]]){const f=new THREE.Group();f.position.set(side*x,floor,-.065);f.rotation.y=side*Math.PI/2;g.add(f);const holes=[];for(let j=0;j<5;j++)holes.push({x:-.25+j*.125,y:h>.4?.21:.055,w:.041,h:.105});wall(k,f,p,w,h,holes);for(const o of holes){frame(k,f,p,o.x,o.y,o.w,o.h);k.box(f,.012,h,.023,p.brick,o.x-.054,h/2,.004);}arcade(k,f,p,w,h-.032,24);k.box(f,w+.018,.005,.025,p.trim,0,h,.005);}
  k.box(g,.12,.008,.66,p.trim,side*.204,.345,-.065);const roof=new THREE.Group();roof.position.set(side*.205,.345,-.065);g.add(roof);gable(k,roof,p,.13,.67,.063,0);
 }
 gable(k,g,p,.31,.69,.10,.486,0,-.065);
 const back=new THREE.Group();back.position.set(0,floor,-.390);back.rotation.y=Math.PI;g.add(back);wall(k,back,p,.52,.285,[{x:0,y:.060,w:.057,h:.125}]);frame(k,back,p,0,.060,.057,.125);const upperRear=new THREE.Group();upperRear.position.y=.285;back.add(upperRear);const rearHoles=[-.06,0,.06].map(x=>({x,y:.025,w:.035,h:.085}));wall(k,upperRear,p,.29,.146,rearHoles);for(const o of rearHoles)frame(k,upperRear,p,o.x,o.y,o.w,o.h);triangle(k,back,p,.31,.10,.431);
 // Octagonal rear drum with repeated real triple-arched openings.
 for(let i=0;i<8;i++){const a=i*TAU/8,f=new THREE.Group();f.position.set(Math.sin(a)*.112,.586,-.235+Math.cos(a)*.112);f.rotation.y=a;g.add(f);const holes=[-.027,0,.027].map(x=>({x,y:.025,w:.020,h:.090}));wall(k,f,p,.093,.145,holes);for(const o of holes)frame(k,f,p,o.x,o.y,o.w,o.h,{shutter:true});triangle(k,f,p,.096,.035,.145);}
 dome(k,g,p,0,-.235,.770,.124,.171);
 const front=new THREE.Group();front.position.z=.362;g.add(front);const holes=[{x:0,y:.055,w:.125,h:.150},...[-.047,0,.047].map(x=>({x,y:.242,w:x===0?.041:.030,h:x===0?.209:.170}))];wall(k,front,p,.265,.574,holes);door(k,front,p,0,.125,.150);for(const o of holes.slice(1))frame(k,front,p,o.x,o.y,o.w,o.h);
 archBands(k,front,p,0,.237,.174,.247,4);for(let i=0;i<26;i++){const a=(i+.5)/26*Math.PI;k.beam(front,[Math.cos(a)*.112,.394+Math.sin(a)*.112,.008],[Math.cos(a)*.143,.394+Math.sin(a)*.143,.008],.008,i%2?p.trim:p.brick,4);}
 arcade(k,front,p,.265,.538,9);triangle(k,front,p,.273,.085,.574);cross(k,front,p,0,.615,.018,.042);for(const y of [.229,.573])k.box(front,.269,.005,.026,p.trim,0,y,.006);
 for(const x of [-.22,.22])tower(k,g,p,x);
 // Four low gate piers leave each of the three entrance approaches open.
 for(const x of [-.322,-.105,.105,.322]){k.box(g,.026,.100,.026,p.brick,x,.103,.429);k.cyl(g,.020,.020,.008,p.trim,x,.157,.429,24);k.cyl(g,.004,.018,.032,p.tile,x,.178,.429,24);cross(k,g,p,x,.208,.429,.031);}
 for(let i=0;i<7;i++){const top=.023+(.055-.023)*(i+1)/7;const mesh=k.box(g,.654,top-.017,.017,p.stone,0,(top+.017)/2,.522-i*.017);mesh.userData.xikaiPaving=true;}
 for(const x of [-.082,.082]){k.box(g,.022,.012,.022,p.trim,x,.062,.392);k.cyl(g,.006,.010,.033,p.trim,x,.083,.392,10);k.ball(g,.008,p.trim,x,.108,.392);k.beam(g,[x,.093,.392],[x+.010,.086,.398],.003,p.trim);}
 grove(k,g,height,[[-.49,-.33,.14],[.49,-.33,.14]]);finish(k,g,{lamps:[[-.39,.023,.40],[.39,.023,.40]],visitors:[[-.23,.023,.53],[.07,.055,.394]]});
 for(const x of [-.22,.22]){const l=new THREE.SpotLight('#f2c48a',0,1.7,.62,.88,2);l.position.set(x,.24,.78);l.target.position.set(x,.49,.36);l.userData.nightIntensity=.075;g.add(l,l.target);}return g;
}
