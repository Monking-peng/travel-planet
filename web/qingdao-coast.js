import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,polygonRoof,railing,sea,lit,skin,sign,TAU} from './qingdao-kit.js';
export function zhanqiao(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.61,.72);sea(k,g,p,.60,.70);p.tile.color.set('#b58d3d');p.red.color.set('#784437');
 k.box(g,.20,.055,.69,p.stone,0,.056,.325);k.cyl(g,.315,.32,.065,p.stone,0,.061,-.185,64);k.cyl(g,.306,.306,.012,p.pale,0,.100,-.185,64);
 for(const x of [-.095,.095]){railing(k,g,{...p,pale:k.mat('#477382',.7)},[[x,.085,.65],[x,.085,.0]],.036);}
 const round=[];for(let i=0;i<=72;i++){const a=.36+i/72*(TAU-.72);round.push([Math.sin(a)*.302,.107,-.185+Math.cos(a)*.302]);}railing(k,g,p,round,.038);
 const q=new THREE.Group();q.position.set(0,.110,-.185);g.add(q);
 k.cyl(q,.185,.185,.18,p.red,0,.09,0,8).rotation.y=Math.PI/8;
 const pane=lit(k,'#46595e',.075);for(let i=0;i<8;i++){const a=i/8*TAU,t=new THREE.Group();q.add(t);t.rotation.y=a;t.position.set(Math.sin(a)*.172,0,Math.cos(a)*.172);for(const x of [-.042,.042]){k.box(t,.035,.105,.004,pane,x,.086,.001);k.box(t,.002,.105,.005,p.red,x,.086,.005);for(let j=0;j<3;j++)k.box(t,.035,.002,.005,p.red,x,.055+j*.03,.005);}k.cyl(t,.005,.006,.18,p.red,-.070,.09,0,10);k.box(t,.14,.027,.009,p.blue,0,.17,.008);}
 polygonRoof(k,q,p,{n:8,r:.258,h:.080,y:.196});
 k.cyl(q,.143,.143,.14,p.red,0,.34,0,8).rotation.y=Math.PI/8;
 for(let i=0;i<8;i++){const a=i/8*TAU,t=new THREE.Group();t.position.set(Math.sin(a)*.134,.0,Math.cos(a)*.134);t.rotation.y=a;q.add(t);for(const x of [-.032,.032]){k.box(t,.050,.092,.004,pane,x,.345,.003);k.box(t,.002,.092,.006,p.red,x,.345,.007);k.box(t,.050,.003,.006,p.red,x,.345,.007);}k.box(t,.11,.018,.008,p.blue,0,.402,.009);}
 polygonRoof(k,q,p,{n:8,r:.215,h:.09,y:.419});sign(k,q,'回澜阁',.067,.035,0,.361,.141,{background:'#2d5f73',color:'#ddc185'});
 for(const side of [-1,1])for(let j=0;j<4;j++){const x=side*.12,z=.10+j*.14;k.beam(g,[x,.095,z],[x,.192,z],.002,p.gold);k.ball(g,.006,p.warm,x,.198,z);}
 return finish(k,g,{visitors:[[.025,.089,.43],[-.035,.089,.27],[.21,.106,-.10]]});
}
export function wind(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.63,.56);paving(k,g,p,.51,.44);const green=k.mat('#55784c',.99);k.cyl(g,.36,.36,.028,p.stone,0,.035,0,80);k.cyl(g,.348,.348,.010,green,0,.054,0,80);
 const red=k.mat('#bf342a',.82,.1);red.userData.night={color:new THREE.Color('#c54c30'),intensity:.16};red.userData.pulse={speed:.56,phase:0};red.userData.windSculpture=true;
 // Solid helical ribbons keep open gaps and a widening upper silhouette.
 const pos=[],ind=[],N=1100,turns=6.2;const profile=[[0,.10],[.20,.125],[.42,.20],[.62,.28],[.78,.34],[.90,.24],[1,.045]],radius=t=>{const i=profile.findIndex(q=>q[0]>=t);if(i<=0)return profile[0][1];const a=profile[i-1],b=profile[i],f=(t-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*f;};
 for(let i=0;i<=N;i++){const t=i/N,a=t*turns*TAU,r=radius(t),y=.072+t*.55,cx=.035*Math.sin(t*TAU*.65),cz=.015*Math.cos(t*TAU*.7);for(const [dr,dy]of [[-.031,-.019],[.031,-.019],[.031,.019],[-.031,.019]])pos.push(cx+Math.cos(a)*(r+dr),y+dy,cz+Math.sin(a)*(r+dr));}
 for(let i=0;i<N;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=b+4,d=a+4;ind.push(a,b,d,b,c,d);}ind.push(0,2,1,0,3,2,N*4,N*4+1,N*4+2,N*4,N*4+2,N*4+3);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(ind);const solid=geo.toNonIndexed();geo.dispose();solid.computeVertexNormals();k.mesh(g,solid,red);
 k.cyl(g,.085,.102,.22,red,0,.17,0,48);for(let i=0;i<3;i++){const q=k.box(g,.023,.080-i*.011,.022,red,(i-1)*.025,.632+i*.020,0);q.rotation.z=-.10;}
 return finish(k,g,{lamps:[[-.38,.023,.28],[.38,.023,.28]],visitors:[[-.12,.024,.41],[.12,.024,.40]]});
}
function sailboat(k,g,p,x,z,size=1,angle=0){
 const q=new THREE.Group();q.position.set(x,.031,z);q.scale.setScalar(size);q.rotation.y=angle;g.add(q);const hull=new THREE.Shape();hull.moveTo(0,.100);hull.quadraticCurveTo(.040,.065,.037,-.06);hull.quadraticCurveTo(0,-.083,-.037,-.06);hull.quadraticCurveTo(-.04,.06,0,.10);hull.closePath();const boat=k.mesh(q,new THREE.ExtrudeGeometry(hull,{depth:.026,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2}),p.pale);boat.rotation.x=-Math.PI/2;boat.position.y=.014;k.box(q,.027,.018,.047,p.blue,0,.045,-.020);k.beam(q,[0,.030,0],[0,.25,0],.0016,p.pale);k.beam(q,[0,.082,0],[.077,.082,0],.0013,p.pale);
 const main=skin(k,q,(u,v)=>[u*.077*(1-v),.08+.16*v,.008*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)],10,14,p.pale);main.material.side=THREE.DoubleSide;skin(k,q,(u,v)=>[-u*.048*(1-v),.06+.17*v,.004*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)],8,12,p.pale);
}
export function marina(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.69,.63);sea(k,g,p,.68,.62);
 k.box(g,1.01,.045,.10,p.stone,0,.048,-.36);k.box(g,.12,.045,.66,p.stone,.445,.048,-.025);k.cyl(g,.117,.117,.045,p.stone,.445,.048,.305,48);k.box(g,.93,.010,.086,p.pale,0,.076,-.36);
 k.box(g,.14,.035,.59,p.stone,-.40,.054,-.015);k.cyl(g,.085,.09,.035,p.stone,-.40,.054,.285,40);
 const torch=new THREE.Group();torch.position.set(-.40,.073,.27);g.add(torch);const red=lit(k,'#b6352d',.16),silver=k.mat('#d4d1bf',.5,.24);red.userData.night.color.copy(red.color);k.cyl(torch,.029,.018,.34,red,0,.17,0,32);k.cyl(torch,.032,.029,.15,silver,0,.415,0,32);k.ball(torch,.032,silver,0,.49,0).scale.y=.25;for(let j=0;j<9;j++)for(let i=0;i<6;i++){const a=i/6*TAU+j*.17,yy=.351+j*.014;const q=k.mesh(torch,new THREE.TorusGeometry(.006,.001,4,16),red,Math.sin(a)*.032,yy,Math.cos(a)*.032);q.rotation.y=a;}
 const white=lit(k,'#e4dfcb',.16),blue=lit(k,'#6e91a0',.14);k.cyl(g,.025,.044,.24,white,.445,.205,.305,32);k.cyl(g,.038,.038,.045,blue,.445,.347,.305,20);k.cyl(g,0,.052,.043,p.red,.445,.391,.305,20);k.cyl(g,.052,.052,.009,white,.445,.323,.305,32);k.ball(g,.009,p.warm,.445,.37,.305);
 for(let j=0;j<7;j++){const z=-.30+j*.073;for(const x of [-.455,-.345]){k.beam(g,[x,.074,z],[x,.20,z],.0015,p.pale);k.box(g,.029,.019,.001,p.pale,x+.015,.187,z);}}
 for(const [x,z,s,a]of [[-.15,-.16,.75,.4],[.10,-.09,.82,-.4],[-.13,.13,1.0,.3],[.20,.21,.70,-.7],[.01,.39,.65,.5]])sailboat(k,g,p,x,z,s,a);
 railing(k,g,p,[[.40,.075,-.33],[.40,.075,.28]],.029);
 return finish(k,g,{lamps:[[-.42,.074,-.31],[.43,.074,-.29],[.43,.074,.19]],visitors:[[-.40,.074,.05],[-.40,.074,-.07]]});
}
