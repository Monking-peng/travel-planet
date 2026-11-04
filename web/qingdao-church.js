import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,gable,pyramid,lit,TAU,skin} from './qingdao-kit.js';
function arch(w,h,Path=THREE.Shape){const s=new Path();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);s.closePath();return s;}
function transformPath(path,x,y){for(const c of path.curves){for(const key of ['v0','v1','v2','v3'])if(c[key]?.isVector2)c[key].add(new THREE.Vector2(x,y));if(c.isEllipseCurve){c.aX+=x;c.aY+=y;}}return path;}
function wall(k,g,p,w,h,holes=[]){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();for(const q of holes){const path=q.round?new THREE.Path().absarc(q.x,q.y,q.w/2,0,TAU,true):transformPath(arch(q.w,q.h,THREE.Path),q.x,q.y);s.holes.push(path);}return k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,curveSegments:16}),p.wall,0,0,-.012);}
function window(k,g,p,x,y,w,h,{shutter=false,blind=false,paired=false,recessed=false}={}){
 const pad=Math.min(.009,w*.25),frame=arch(w+pad,h+pad*.66);frame.holes.push(transformPath(arch(w,h,THREE.Path),0,.002));k.mesh(g,new THREE.ExtrudeGeometry(frame,{depth:.005,bevelEnabled:false,curveSegments:18}),p.pale,x,y-.002,.001);
 k.mesh(g,new THREE.ShapeGeometry(arch(w,h),20),blind?p.recess:shutter?p.shutter:p.glass,x,y,recessed?-.008:.002);
 if(!blind)k.box(g,w+pad*1.5,.003,.021,p.sill,x,y-.003,-.001);
 if(blind)return;
 if(shutter){for(let j=1;j<(h-w*.5)/.005;j++)k.box(g,w-.003,.0015,.003,p.slats,x,y+j*.005,recessed?-.005:.004);if(paired)k.box(g,.002,h-w*.5,.005,p.pale,x,y+(h-w*.5)/2,.001);}
 else{for(let j=1;j<4;j++)k.box(g,w,.001,.004,p.sill,x,y+(h-w*.5)*j/4,recessed?-.003:.005);k.box(g,.001,h-w*.45,.004,p.sill,x,y+(h-w*.45)/2,recessed?-.003:.005);for(let i=0;i<3;i++){const o=k.mesh(g,new THREE.CircleGeometry(w*.09,8),p.tint[i],x+(i-1)*w*.21,y+h*.38,recessed?-.002:.006);}}
}
function arcade(k,g,p,w,y,n=12,h=.012){for(let i=0;i<n;i++){const x=((i+.5)/n-.5)*w;window(k,g,p,x,y,w/n*.58,h,{blind:true});}}
function quoins(k,g,p,w,h){for(const side of [-1,1])for(let j=0;j<h/.023;j++)k.box(g,.025,.022,.003,p.pale,side*(w/2-.0125),.011+j*.023,.001);}
function cross(k,g,p,x,y,z,h=.060){k.box(g,.003,h,.003,p.bronze,x,y,z);k.box(g,h*.60,.003,.003,p.bronze,x,y+h*.15,z);for(const [dx,dy]of [[0,h/2],[0,-h/2],[-h*.30,h*.15],[h*.30,h*.15]])k.ball(g,.0035,p.bronze,x+dx,y+dy,z);k.cyl(g,.006,.007,.006,p.bronze,x,y-h*.55,z,16);}
function rose(k,g,p,x,y,r){const s=new THREE.Shape().absarc(0,0,r+.007,0,TAU,false);s.holes.push(new THREE.Path().absarc(0,0,r,0,TAU,true));k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.014,bevelEnabled:false}),p.pale,x,y,-.002);k.mesh(g,new THREE.CircleGeometry(r,64),p.glass,x,y,-.009);for(const rr of [r+.002,r+.007])k.mesh(g,new THREE.TorusGeometry(rr,.0014,6,64),p.sill,x,y,.014);
 const small=r*.31;k.mesh(g,new THREE.TorusGeometry(small,.0018,6,48),p.pale,x,y,.010);for(let i=0;i<6;i++){const a=i*TAU/6,xx=x+Math.sin(a)*r*.63,yy=y+Math.cos(a)*r*.63;k.mesh(g,new THREE.CircleGeometry(r*.17,24),p.tint[i%3],xx,yy,-.008);k.mesh(g,new THREE.TorusGeometry(small,.0018,6,36),p.pale,xx,yy,.010);k.mesh(g,new THREE.TorusGeometry(r*.12,.0006,5,24),p.sill,xx,yy,.011);}}
function doorway(k,g,p,x,w,h,main=false,base=.04){const spring=h-w/2;for(let ring=0;ring<3;ring++){const r=w/2+.004+ring*.004;k.line(g,Array.from({length:37},(_,i)=>[x+Math.cos(i/36*Math.PI)*r,base+spring+Math.sin(i/36*Math.PI)*r,.026+ring*.002]),.0018,p.pale);for(const side of [-1,1]){k.cyl(g,.0028,.0035,spring,p.pale,x+side*r,base+spring/2,.027+ring*.002,10);k.box(g,.012,.004,.016,p.pale,x+side*r,base+spring-.002,.029);}}
 for(let i=0;i<28;i++){const a=i/27*Math.PI;k.ball(g,.0021,p.carving,x+Math.cos(a)*(w/2+.015),base+spring+Math.sin(a)*(w/2+.015),.032);}
 k.mesh(g,new THREE.ShapeGeometry(arch(w,h),24),p.door,x,base,-.010);k.box(g,w+.014,.008,.031,p.pale,x,base+spring*.8,.010);
 const leaves=main?2:1;for(let i=0;i<leaves;i++){const xx=x+(i-(leaves-1)/2)*w*.47;k.box(g,w*(main?.40:.82),spring*.75,.003,p.shutter,xx,base+spring*.375,-.006);for(let row=0;row<4;row++)for(let col=0;col<2;col++){const cx=xx+(col-.5)*w*(main?.17:.31),cy=base+spring*(.10+row*.16);k.box(g,w*.10,spring*.10,.002,p.door,cx,cy,-.003);}}
 if(main){k.box(g,.009,spring*.8,.032,p.pale,x,base+spring*.4,.013);const fan=arch(w*.84,h*.40);k.mesh(g,new THREE.ShapeGeometry(fan),p.recess,x,base+spring*.83,-.002);cross(k,g,p,x,base+spring+w*.21,.010,w*.26);for(let i=0;i<7;i++){const a=i/6*Math.PI;k.line(g,Array.from({length:10},(_,j)=>{const b=j/9*Math.PI;return [x+Math.cos(a)*w*.26+Math.cos(b)*w*.11,base+spring+Math.sin(a)*w*.26+Math.sin(b)*w*.11,.005];}),.0007,p.pale);}}
}
function triangular(k,g,p,w,h,y,{round=true}={}){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.013,bevelEnabled:false}),p.wall,0,y,-.008);k.line(g,[[-w/2,y,.008],[0,y+h,.008],[w/2,y,.008]],.002,p.pale);for(let i=-5;i<=5;i++){const x=i*w/12,yy=y+h*(1-Math.abs(x)/(w/2))-.014;window(k,g,p,x,yy,.005,.010,{blind:true});}if(round){k.mesh(g,new THREE.CircleGeometry(w*.10,32),p.shutter,0,y+h*.30,.007);k.mesh(g,new THREE.TorusGeometry(w*.105,.0015,6,40),p.sill,0,y+h*.30,.009);}}
function bellTower(k,g,p,x){const t=new THREE.Group();t.position.set(x,.04,.25);g.add(t);const w=.158,d=.18,levels=[0,.170,.350,.505,.590,.680];
 for(let face=0;face<4;face++){const a=face*TAU/4,f=new THREE.Group();f.rotation.y=a;f.position.set(Math.sin(a)*w/2,0,Math.cos(a)*d/2);t.add(f);
  for(let level=0;level<5;level++){const start=levels[level],end=levels[level+1],s=new THREE.Group();s.position.y=start;f.add(s);const holes=[];
   if(level===0){if(face===0)holes.push({x:0,y:0,w:.083,h:.135});else holes.push({x:0,y:.055,w:.032,h:.063});}
   if(level===1||level===2)holes.push({x:0,y:.047,w:.041,h:.080});
   if(level===3)for(const xx of [-.031,.031])holes.push({x:xx,y:.017,w:.038,h:.055});
   if(level===4)for(const xx of [-.032,.032])holes.push({x:xx,y:.018,w:.039,h:.061});
   wall(k,s,p,w,end-start,holes);quoins(k,s,p,w,end-start);k.box(s,w+.008,.004,.018,p.sill,0,end-start,.001);arcade(k,s,p,w*.60,end-start-.022,10,.011);
   for(const o of holes){if(level===0&&face===0)doorway(k,s,p,0,.083,.135,false,0);else if(level===4){window(k,s,p,o.x,o.y,o.w,o.h,{blind:true,recessed:true});for(const dx of [-.009,.009])window(k,s,p,o.x+dx,o.y,.015,.044,{shutter:true});k.mesh(s,new THREE.CircleGeometry(.0045,20),p.shutter,o.x,o.y+.050,.006);}else window(k,s,p,o.x,o.y,o.w,o.h,{shutter:level>=3,recessed:true});}
  }
  triangular(k,f,p,w+.010,.062,.680);
 }
 pyramid(k,t,p,.181,.218,.680,0,0);cross(k,t,p,0,.932,0,.060);
}
function roundApse(k,g,p){const z=-.30;
 for(const [r,y,h]of [[.225,.04,.145],[.141,.218,.132]]){const o=k.mesh(g,new THREE.CylinderGeometry(r,r,h,64,1,false,Math.PI/2,Math.PI),p.wall,0,y+h/2,z);o.material.userData.churchMasonry=true;
  for(const [rr,yy]of [[r+.004,y+h-.006],[r+.002,y+.006]])k.mesh(g,new THREE.CylinderGeometry(rr,rr,.005,64,1,true,Math.PI/2,Math.PI),p.pale,0,yy,z);
  for(let i=0;i<7;i++){const a=Math.PI*.55+i*Math.PI*.90/6,f=new THREE.Group();f.position.set(Math.sin(a)*(r+.002),y+.027,z+Math.cos(a)*(r+.002));f.rotation.y=a;g.add(f);window(k,f,p,0,0,.025,h*.58);arcade(k,f,p,.058,h-.044,6,.010);}
  const rise=r>.2?.052:.092,outer=r+.010,top=y+h+rise,inside=r>.2?.135:0;skin(k,g,(u,v)=>{const a=Math.PI/2+u*Math.PI,rr=inside+(outer-inside)*v;return [Math.sin(a)*rr,top-rise*v,z+Math.cos(a)*rr];},8,64,p.tile);
  for(let j=1;j<=8;j++){const v=j/8,rr=inside+(outer-inside)*v;k.line(g,Array.from({length:65},(_,i)=>{const a=Math.PI/2+i/64*Math.PI;return [Math.sin(a)*rr,top-rise*v+.0008,z+Math.cos(a)*rr];}),.0006,p.red);}
 }
}
export function church(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.63,.61);paving(k,g,p,.50,.48);p.wall=k.mat('#c9b28a',.97);p.wall.userData.churchMasonry=true;p.pale=k.mat('#c4b998',.96);p.sill=k.mat('#8d8570',.94);p.recess=k.mat('#a08d6e',.98);p.door=k.mat('#3c332c',.96);p.shutter=k.mat('#713e32',.95);p.slats=k.mat('#94624b',.95);p.bronze=k.mat('#5e7063',.68,.30);p.carving=k.mat('#b3a284',.97);p.glass=lit(k,'#40565e',.06);p.tint=['#536a78','#6b6570','#746d4c'].map(c=>lit(k,c,.055));p.tile=k.mat('#a9523c',.96);p.red=k.mat('#8f4b3a',.95);
 // An open nave, side aisles, crossing and stepped semicircular apse form the actual silhouette.
 k.box(g,.48,.015,.68,p.stone,0,.035,-.015);
 for(const side of [-1,1]){const f=new THREE.Group();f.position.set(side*.14,.04,-.025);f.rotation.y=side*Math.PI/2;g.add(f);wall(k,f,p,.57,.345);for(let bay=0;bay<3;bay++){const xx=-.20+bay*.145;for(let j=-1;j<=1;j++)window(k,f,p,xx+j*.031,.205,.025,.075);arcade(k,f,p,.12,.320,12,.012);}
  k.box(g,.11,.174,.57,p.wall,side*.204,.127,-.025);const roof=new THREE.Group();roof.position.set(side*.205,.214,-.025);g.add(roof);gable(k,roof,p,.13,.59,.046,0);
  const aisle=new THREE.Group();aisle.position.set(side*.260,.04,-.025);aisle.rotation.y=side*Math.PI/2;g.add(aisle);for(let i=0;i<6;i++)window(k,aisle,p,-.24+i*.09,.035,.026,.066);
 }
 gable(k,g,p,.30,.61,.14,.387,0,-.025);
 const crossing=new THREE.Group();crossing.rotation.y=Math.PI/2;crossing.position.z=-.235;g.add(crossing);for(const x of [-.087,.087])k.box(crossing,.010,.348,.62,p.wall,x,.214,0);gable(k,crossing,p,.20,.64,.146,.388);
 for(const side of [-1,1]){const f=new THREE.Group();f.position.set(side*.316,.04,-.235);f.rotation.y=side*Math.PI/2;g.add(f);wall(k,f,p,.18,.348,[{x:0,y:.219,w:.099,round:true}]);rose(k,f,p,0,.219,.049);for(const xx of [-.04,0,.04])window(k,f,p,xx,.130,.030,.053);triangular(k,f,p,.195,.144,.348,{round:false});for(const xx of [-.035,0,.035])window(k,f,p,xx,.365,.018,.050+(xx===0?.035:0),{shutter:true});}
 const rear=new THREE.Group();rear.position.set(0,.04,-.334);rear.rotation.y=Math.PI;g.add(rear);wall(k,rear,p,.28,.348);triangular(k,rear,p,.30,.14,.348,{round:false});for(const xx of [-.036,0,.036])window(k,rear,p,xx,.366,.018,.046+(xx===0?.036:0),{shutter:true});roundApse(k,g,p);
 // The western facade has a recessed rose, blind upper arcade and sculpted entrance.
 const front=new THREE.Group();front.position.z=.343;g.add(front);wall(k,front,p,.278,.536,[{x:0,y:.04,w:.144,h:.164},{x:0,y:.287,w:.112,round:true}]);doorway(k,front,p,0,.144,.164,true);rose(k,front,p,0,.287,.056);
 k.line(front,[[-.106,.195,.028],[0,.261,.028],[.106,.195,.028]],.003,p.pale);k.mesh(front,new THREE.TorusGeometry(.010,.002,6,32),p.pale,0,.224,.018);
 for(const x of [-.029,0,.029]){k.box(front,.024,.062,.006,p.shutter,x,.411,-.001);for(let j=0;j<11;j++)k.box(front,.023,.0014,.004,p.slats,x,.383+j*.005,.002);}
 for(let i=0;i<7;i++){const x=(i-3)*.036;window(k,front,p,x,.458,.032,.040,{blind:true});k.cyl(front,.0025,.003,.034,p.pale,x-.018,.475,.009,8);}
 arcade(k,front,p,.278,.514,30,.014);for(const y of [.358,.449,.503,.534])k.box(front,.280,.004,.020,p.sill,0,y,.005);
 for(const x of [-.218,.218])bellTower(k,g,p,x);
 steps(k,g,p,0,.485,.63,5,.025,.075);grove(k,g,h,[[-.47,-.28,.14],[.47,-.30,.14]]);
 finish(k,g,{lamps:[[-.40,.024,.39],[.4,.024,.39]],visitors:[[-.10,.046,.43],[.08,.046,.45],[.15,.046,.43]]});
 for(const x of [-.26,.26]){const l=new THREE.SpotLight('#e4d6b8',0,1.3,.64,.85,2);l.position.set(x,.62,.82);l.target.position.set(x,.43,.30);l.userData.nightIntensity=.045;g.add(l,l.target);}return g;
}
