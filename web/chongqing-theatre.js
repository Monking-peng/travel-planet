import * as THREE from 'three';
import {disc,sign,finish} from './chongqing-kit.js';
function ground(x,z){const t=THREE.MathUtils.smoothstep(Math.hypot(x/1.09,z/1.17),.85,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));return .014*(1-t)-sag*t+.002;}
function panel(k,g,corners,mat){
 const p=corners.map(v=>new THREE.Vector3(...v)),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(corners.flat(),3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,p[0].distanceTo(p[1])/.024,0,p[0].distanceTo(p[1])/.024,p[1].distanceTo(p[2])/.020,0,p[0].distanceTo(p[3])/.020],2));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();return k.mesh(g,geo,mat);
}
function glass(k,color,phase,intensity=.58){
 const m=k.mat(color,.45,.23);m.map=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);m.map.needsUpdate=true;m.side=THREE.DoubleSide;m.userData.night={color:new THREE.Color('#cbdfcc'),intensity};m.userData.pulse={phase,speed:.23};m.userData.theatreGlass=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 vPanelUv;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvPanelUv=uv;');s.fragmentShader='varying vec2 vPanelUv;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 seam=min(fract(vPanelUv),1.0-fract(vPanelUv));vec2 fw=max(fwidth(vPanelUv),vec2(.0001));vec2 line=1.0-smoothstep(vec2(.022)-fw,vec2(.022)+fw,seam);float joint=max(line.x,line.y);float panelTone=fract(sin(dot(floor(vPanelUv),vec2(12.9898,78.233)))*43758.5453);diffuseColor.rgb*=mix(.97+.03*panelTone,.78,joint);`);s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance*=mix(.97+.03*panelTone,.38,joint);');};m.customProgramCacheKey=()=> 'chongqing-theatre-panels';return m;
}
export function theatre(k){
 const g=new THREE.Group(),p={land:k.mat('#93a386',.98),stone:k.mat('#c9c7b7',.90),joint:k.mat('#a6afa4',.85),frame:k.mat('#c6d0c3',.71),dark:k.mat('#38534f',.54,.16),roof:k.mat('#9db5a7',.62,.16),leaf:k.mat('#75865b',.96)};p.land.userData.landscape=true;
 disc(k,g,1.09,1.17,ground,p.land);
 // The heavy stone podium is separate from the folded translucent envelope.
 const outline=[[-.72,-.77],[.72,-.77],[.79,-.48],[.79,.50],[.59,.78],[-.59,.78],[-.79,.50],[-.79,-.48]];
 const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));const plinth=k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.088,bevelEnabled:false}),p.stone,0,.018,0);plinth.rotation.x=-Math.PI/2;
 for(let i=0;i<9;i++){const z=.936-i*.018,top=.018+(i+1)*.0098;k.box(g,.44,top-.015,.019,p.stone,0,(top+.015)/2,z);}
 k.box(g,.44,.006,.060,p.stone,0,.104,.763);
 for(let i=-7;i<=7;i++){const z=i*.10;k.box(g,1.42,.0006,.0013,p.joint,0,.107,z);}for(let i=-6;i<=6;i++)k.box(g,.0012,.0006,1.38,p.joint,i*.11,.107,0);
 const slots=k.mat('#344e48',.53,.14);slots.userData.theatreSlot=true;
 const shell=[glass(k,'#9bb8aa',.4,.62),glass(k,'#a1bcae',1.1,.54),glass(k,'#89aa9e',1.8,.48),glass(k,'#91b1a3',2.5,.58)],roofGlass=glass(k,'#a0b9ac',.7,.35),clear=k.mat('#6e9287',.31,.24);clear.transparent=true;clear.opacity=.54;clear.depthWrite=false;clear.side=THREE.DoubleSide;clear.userData.night={color:new THREE.Color('#dbdfc3'),intensity:.33};clear.userData.theatreFoyer=true;
 // Six projecting fingers rise and fold towards the longitudinal stage houses.
 const strips=[[-.64,-.44,.39,.25,.03,.38,-.61,.24],[-.44,-.22,.55,.31,-.03,.42,-.67,.29],[-.22,0,.67,.33,-.06,.44,-.68,.30],[0,.22,.69,.34,-.05,.45,-.68,.31],[.22,.44,.57,.30,-.03,.41,-.66,.28],[.44,.64,.40,.24,.02,.36,-.59,.23]];
 strips.forEach(([l,r,f,fy,kz,ky,b,by],index)=>{
  const bottom=.108,lean=.075;
  const line=[[f-.095,bottom],[f,fy],[kz,ky],[b,by],[b+.045,bottom]];
  const left=line.map(([z,y])=>[l-(y-bottom)*.045,y,z]),right=line.map(([z,y])=>[r+(y-bottom)*.045,y,z]);
  // Solid side facets retain the irregular small slot-window groupings.
  for(const [side,points]of [[-1,left],[1,right]]){
   for(let j=0;j<3;j++)panel(k,g,[[(side<0?l:r),bottom,points[j][2]],points[j],points[j+1],[(side<0?l:r),bottom,points[j+1][2]]],shell[(index+j)%4]);
   if(index<3&&side===-1||index>=3&&side===1){
    for(const [z,y,count]of [[.17,.22,4],[-.18,.28,5],[-.46,.18,3],[.31,.15,2],[-.42,.31,3]])for(let n=0;n<count;n++){
     const roofY=z>=kz?fy+(ky-fy)*(f-z)/(f-kz):ky+(by-ky)*(kz-z)/(kz-b);if(y+.020>roofY)continue;const x=(side<0?l:r)+side*((y-bottom)*.045+.0015);k.box(g,.002,.037,.009,slots,x,y,z+n*.016);
    }
   }
  }
  // Roof folded edges stay pale; joints are fine glass seams, not thick cages.
  for(let j=1;j<3;j++){panel(k,g,[left[j],right[j],right[j+1],left[j+1]],roofGlass);k.beam(g,left[j],left[j+1],.0022,p.frame,5);k.beam(g,right[j],right[j+1],.0022,p.frame,5);}
  panel(k,g,[left[3],right[3],right[4],left[4]],shell[(index+2)%4]);
  const frontA=left[0],frontB=right[0],frontC=right[1],frontD=left[1];
  if(index===2||index===3){
   // Upper glazed foyer leans over a real recessed ground-floor entrance.
   const ratio=(.19-bottom)/(fy-bottom),cutL=new THREE.Vector3(...frontA).lerp(new THREE.Vector3(...frontD),ratio).toArray(),cutR=new THREE.Vector3(...frontB).lerp(new THREE.Vector3(...frontC),ratio).toArray();
   panel(k,g,[cutL,cutR,frontC,frontD],clear);
   const z=f-.12;panel(k,g,[[l,bottom,z],[r,bottom,z],[r,.19,z],[l,.19,z]],clear);
   k.box(g,r-l,.008,.07,p.frame,(l+r)/2,.185,z+.03);
   for(let q=0;q<=4;q++)k.box(g,.002,.080,.003,p.frame,l+(r-l)*q/4,.148,z+.002);
  }else panel(k,g,[frontA,frontB,frontC,frontD],shell[index%4]);
  // Deep inclined ladder frames are visible through the foyer glazing.
  const a=new THREE.Vector3(...frontA),b1=new THREE.Vector3(...frontD);a.z-=.007;b1.z-=.007;k.beam(g,a.toArray(),b1.toArray(),.007,p.frame,6);
  for(let j=1;j<=8;j++){const t=j/9,a1=a.clone().lerp(b1,t);k.beam(g,a1.toArray(),[a1.x+.026,a1.y,a1.z],.0025,p.frame,5);}
 });
 // The unequal stage volumes sit in line, with taper and sloping upper faces.
 for(const [x,z,w,d,h,phase]of [[-.035,-.01,.38,.33,.72,0],[.04,-.45,.30,.24,.55,2]]){
  const b=.31,points=[[x-w/2,b,z+d/2],[x+w/2,b,z+d/2],[x+w/2,b,z-d/2],[x-w/2,b,z-d/2],[x-w*.43,h,z+d*.40],[x+w*.43,h-.025,z+d*.40],[x+w*.41,h-.045,z-d*.42],[x-w*.41,h-.020,z-d*.42]],mat=glass(k,'#8bab9e',phase,.51);mat.userData.theatreStage=true;
  for(const f of [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]])panel(k,g,f.map(i=>points[i]),mat);
  for(let j=1;j<5;j++){const t=j/5,a=new THREE.Vector3(...points[0]).lerp(new THREE.Vector3(...points[1]),t),b1=new THREE.Vector3(...points[4]).lerp(new THREE.Vector3(...points[5]),t);a.z+=.002;b1.z+=.002;k.beam(g,a.toArray(),b1.toArray(),.0026,p.dark,5);}
 }
 // Ground-level recesses articulate the stone base; planting stays at its edge.
 for(const side of [-1,1])for(let i=0;i<12;i++)k.box(g,.003,.034,.018,p.dark,side*.7905,.054,-.40+i*.071);
 for(const side of [-1,1])for(const z of [-.62,-.12,.40]){k.box(g,.045,.012,.15,p.joint,side*.715,.112,z);k.box(g,.037,.016,.14,p.leaf,side*.715,.125,z);}
 const lamp=k.mat('#d4c6a5',.65,0,'#eedcaa');lamp.userData.night.intensity=.74;lamp.userData.pulse={speed:.31,phase:1};
 for(const x of [-.57,.57])for(const z of [-.69,.68]){k.cyl(g,.002,.003,.071,p.dark,x,.142,z,6);k.ball(g,.0035,lamp,x,.178,z);}
 sign(k,g,'重庆大剧院',.19,.026,0,.205,.677,{background:'#94b3a5',color:'#36544d'});
 return finish(k,g);
}
