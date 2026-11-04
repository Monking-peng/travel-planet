import * as THREE from 'three';
import {palette,site,disc,sea,finish,grove,sign,TAU} from './quanzhou-kit.js';
function masonry(k,color,{tide=false,courses=true}={}){
 const m=k.mat(color,.98,.015);m.userData.luoyangStructure=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 lyStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nlyStone=position;');s.fragmentShader='varying vec3 lyStone;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  vec3 p=lyStone;float grit=fract(sin(dot(floor(p*1850.0),vec3(13.4,71.8,29.3)))*43758.5);float stain=sin(p.x*31.0+p.z*28.0)*sin(p.y*39.0-p.z*17.0);
  diffuseColor.rgb*=.89+grit*.13+stain*.035;
  ${courses?'vec2 q=vec2((p.x+p.z)*24.0,p.y*72.0);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),aa=max(fwidth(q),vec2(.008));float seam=max(1.0-smoothstep(.018,.018+aa.x,min(f.x,1.0-f.x)),1.0-smoothstep(.022,.022+aa.y,min(f.y,1.0-f.y)));diffuseColor.rgb*=1.0-seam*.22;':''}
  ${tide?'float wet=1.0-smoothstep(.047,.092,p.y);diffuseColor.rgb*=1.0-wet*.32;diffuseColor.rgb+=wet*step(.93,grit)*.12;':''}
 `);};m.customProgramCacheKey=()=>`luoyang-granite-${tide}-${courses}`;return m;
}
function prism(k,g,points,b,h,m){const sh=new THREE.Shape();points.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false});geo.rotateX(-Math.PI/2);return k.mesh(g,geo,m,0,b,0);}
function guard(k,g,p,x1,x2,z,y=.203){
 const n=Math.ceil((x2-x1)/.08);for(let i=0;i<=n;i++){const x=x1+(x2-x1)*i/n;k.box(g,.016,.065,.020,p.pale,x,y+.0325,z);k.box(g,.021,.008,.024,p.pale,x,y+.065,z);}
 for(const yy of [.014,.047])k.box(g,x2-x1,.011,.012,p.pale,(x1+x2)/2,y+yy,z);
}
function slope(k,g,p,side){
 const n=21;for(let i=0;i<n;i++){const t=(i+.5)/n,x=side*(.66+t*.21),top=.203-t*.158;k.box(g,.21/n+.0002,top-.025,.18,p.stone,x,(top+.025)/2,0);}
}
function pavilion(k,g,p){
 const a=new THREE.Group();a.position.set(-.29,0,-.28);g.add(a);
 k.box(a,.245,.027,.217,p.stone,0,.2115,0);k.box(a,.254,.008,.226,p.pale,0,.229,0);
 for(let i=0;i<4;i++){const top=.198+(i+1)*.035/4;k.box(a,.10,top-.196,.017,p.stone,0,(top+.196)/2,.168-i*.016);}
 for(const x of [-.092,.092])for(const z of [-.080,.080]){k.box(a,.028,.017,.028,p.pale,x,.2415,z);k.box(a,.016,.135,.017,p.pale,x,.3175,z);k.box(a,.031,.011,.031,p.stone,x,.381,z);k.box(a,.041,.008,.037,p.pale,x,.391,z);}
 for(const z of [-.080,.080])k.box(a,.224,.015,.024,p.pale,0,.401,z);for(const x of [-.092,.092])k.box(a,.024,.015,.215,p.pale,x,.401,0);
 for(let i=0;i<7;i++)k.box(a,.009,.011,.23,p.stone,(i-3)*.031,.413,0);
 const geo=new THREE.BufferGeometry(),v=[],uv=[],idx=[],N=20,W=30;
 for(const side of [-1,1]){const off=v.length/3;for(let j=0;j<=N;j++)for(let i=0;i<=W;i++){const u=i/W,t=j/N,x=(u-.5)*.29,z=side*t*.128,y=.461-.048*t+.017*t**5+.018*Math.abs(u*2-1)**6;v.push(x,y,z);uv.push(u,t);}for(let j=0;j<N;j++)for(let i=0;i<W;i++){const b=off+j*(W+1)+i,c=b+W+1;idx.push(b,c,b+1,b+1,c,c+1);}}
 geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const roof=p.roof;roof.side=THREE.DoubleSide;k.mesh(a,geo,roof);
 for(const side of [-1,1]){k.line(a,Array.from({length:31},(_,i)=>{const x=(i/30-.5)*.29;return[x,.430+.018*Math.abs(x/.145)**6,side*.128];}),.003,p.stone);for(let i=0;i<15;i++){const x=(i/14-.5)*.285;k.line(a,Array.from({length:12},(_,j)=>{const t=j/11;return[x,.462-.048*t+.017*t**5+.018*Math.abs(x/.145)**6,side*t*.128];}),.0011,p.stone);}}
 k.line(a,[[-.15,.482,0],[-.10,.465,0],[.10,.465,0],[.15,.482,0]],.004,p.pale);
 const tablet=k.box(a,.075,.115,.020,p.pale,0,.294,-.017);tablet.rotation.z=.012;['西','川','甘','雨'].forEach((c,i)=>sign(k,a,c,.020,.021,0,.333-i*.024,-.005,{background:'#a9a58f',color:'#833e32'}));
}
function banyan(k,g,p,x,z,h){
 const a=new THREE.Group();a.position.set(x,.197,z);g.add(a);const trunk=k.mat('#7f7762',.98),leaves=[k.mat('#506c43',.98),k.mat('#60774a',.98),k.mat('#49613c',.99)];
 k.cyl(a,.009,.018,h*.58,trunk,0,h*.29,0,9);
 for(let i=0;i<9;i++){const an=i/9*TAU,dx=Math.sin(an),dz=Math.cos(an);k.line(a,[[dx*.003,h*.43,dz*.003],[dx*.014,h*.19,dz*.015],[dx*.033,.018,dz*.030],[dx*.052,.003,dz*.046]],.0023,trunk);}
 for(let i=0;i<17;i++){const an=i*2.399,r=Math.sqrt(i/17)*h*.48,xx=Math.sin(an)*r,zz=Math.cos(an)*r,yy=h*(.72+.20*Math.sin(i*1.7));if(i<8)k.beam(a,[0,h*.40,0],[xx,yy*.84,zz],.003,trunk);const o=k.mesh(a,new THREE.DodecahedronGeometry(h*(.19+(i%4)*.015),1),leaves[i%3],xx,yy,zz);o.scale.set(1.3,.77,1.1);o.rotation.y=an;}
}
function moonTower(k,g,p,x,z){
 const a=new THREE.Group();a.position.set(x,.203,z);g.add(a);
 for(const [y,w,h]of [[.012,.126,.024],[.032,.111,.016],[.061,.093,.042],[.090,.112,.016],[.110,.100,.024],[.127,.112,.010]])k.box(a,w,h,w,p.stone,0,y,0);
 k.box(a,.077,.091,.077,p.pale,0,.178,0);for(const s of [-1,1]){const face=new THREE.Group();face.rotation.y=s*Math.PI/2;a.add(face);for(let i=0;i<5;i++){const xx=(i-2)*.014;k.box(face,.010,.029,.0014,p.relief,xx,.111,.051);}}
 const niche=k.mesh(a,new THREE.CircleGeometry(.026,32),p.dark,0,.181,.039);niche.scale.x=.77;
 const head=k.ball(a,.016,p.pale,0,.181,.041);head.scale.set(.72,1.10,.29);k.ball(a,.0029,p.stone,-.006,.183,.045);k.ball(a,.0029,p.stone,.006,.183,.045);k.box(a,.002,.010,.003,p.pale,0,.178,.046);k.line(a,[[-.005,.171,.045],[0,.169,.047],[.005,.171,.045]],.001,p.stone);
 for(const sx of [-1,1])k.line(a,Array.from({length:20},(_,i)=>{const t=i/19*Math.PI;return[sx*(.014+.005*Math.sin(t)),.185+.026*Math.cos(t),.040];}),.0016,p.stone);
 for(const side of [-1,1]){const f=new THREE.Group();f.rotation.y=side*Math.PI/2;a.add(f);sign(k,f,side===1?'诸佛出世':'涅槃经',.066,.070,0,.177,.040,{background:'#a29e89',color:'#895148'});}
 prism(k,a,[[-.061,-.061],[.061,-.061],[.061,.061],[-.061,.061]],.224,.014,p.stone);k.box(a,.106,.010,.106,p.pale,0,.243,0);k.cyl(a,.024,.040,.020,p.pale,0,.257,0,4);k.cyl(a,.012,.015,.025,p.stone,0,.277,0,12);
 for(let i=0;i<7;i++)k.cyl(a,.014-i*.0007,.015-i*.0007,.011,p.stone,0,.292+i*.012,0,12);k.cyl(a,.001,.009,.018,p.pale,0,.382,0,12);
}
function pagoda(k,g,p,x,z){
 const a=new THREE.Group();a.position.set(x,.14,z);g.add(a);k.cyl(a,.055,.065,.030,p.stone,0,.015,0,8);
 for(let j=0;j<5;j++){const y=.033+j*.050,r=.033-j*.002;k.cyl(a,r,r+.002,.034,p.stone,0,y+.017,0,8);for(let s=0;s<8;s++){const f=new THREE.Group();f.rotation.y=s/8*TAU;a.add(f);k.box(f,.012,.021,.001,p.dark,0,y+.019,r*.927);const head=k.ball(f,.004,p.pale,0,y+.021,r*.93);head.scale.z=.35;}k.cyl(a,r+.002,r+.013,.012,p.pale,0,y+.039,0,8);k.cyl(a,r-.007,r+.002,.009,p.stone,0,y+.049,0,8);}
 k.cyl(a,.005,.007,.065,p.pale,0,.322,0,10);k.cyl(a,.002,.008,.023,p.stone,0,.365,0,10);
}
export function luoyang(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.88,.59);sea(k,g,p,.85,.545);p.stone=masonry(k,'#a3a18d');p.pale=masonry(k,'#b7b4a0',{courses:false});p.dark=k.mat('#747564',.99);p.relief=k.mat('#8f8e79',.98);p.roof=masonry(k,'#777d71',{courses:false});const pier=masonry(k,'#94927f',{tide:true});pier.userData.luoyangPiers=true;g.userData.bridgeType='stone-beam';
 // The model compresses the real bridge's length and span count, retaining its structural system.
 for(let i=0;i<9;i++){const x=(i-4)*.1525;prism(k,g,[[x-.042,.112],[x+.042,.112],[x+.042,-.105],[x,-.251],[x-.042,-.105]],.026,.078,pier);k.box(g,.072,.076,.188,pier,x,.142,0);k.box(g,.093,.011,.203,p.stone,x,.1855,0);}
 for(let i=0;i<9;i++)for(let j=0;j<4;j++)k.box(g,.1471,.012,.0401,p.pale,(i-4)*.147,.197,(j-1.5)*.040);
 for(const side of [-1,1]){const top=(x,z)=>{const t=Math.max(0,Math.min(1,(Math.abs(x)-.66)/.20));return .028+.167*(1-t);};disc(k,g,.13,.20,(x,z)=>top(side*.74+x,z),p.stone,side*.74,0);slope(k,g,p,side);}
 const outline=[[-.53,-.065],[-.12,-.065],[-.075,-.16],[-.11,-.39],[-.27,-.48],[-.48,-.41],[-.57,-.24]];prism(k,g,outline,.026,.170,p.stone);
 guard(k,g,p,-.66,.66,.086);guard(k,g,p,-.66,-.54,-.086);guard(k,g,p,-.09,.42,-.086);guard(k,g,p,.60,.66,-.086);
 pavilion(k,g,p);banyan(k,g,p,-.48,-.28,.19);banyan(k,g,p,-.16,-.40,.21);
 // Keep the Moonlight tower distinct from the separate five-storey stone pagoda.
 k.box(g,.17,.040,.12,p.stone,.51,.183,-.13);moonTower(k,g,p,.51,-.145);pagoda(k,g,p,-.73,.135);
 for(let i=0;i<16;i++){const t=i/15,a=t*TAU,rock=k.mesh(g,new THREE.DodecahedronGeometry(.013+(i%3)*.005,0),p.stone,-.31+Math.cos(a)*.28,.045,-.25+Math.sin(a)*.24);rock.scale.set(1.5,.6,1.0);}
 return finish(k,g,{lamps:[[-.57,.198,.04],[.62,.203,.06],[-.10,.197,-.19]],visitors:[[-.58,.203,.010],[-.39,.203,.016],[-.13,.203,-.010],[.10,.203,.020],[.28,.203,-.014],[.58,.203,.012],[-.20,.197,-.18],[-.44,.197,-.13]]});
}
