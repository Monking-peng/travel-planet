import * as THREE from 'three';
import {palette,site,paving,grove,finish,skin} from './nanjing-kit.js';

// Rounded interlocking masses and a recessed, structurally closed mechanical band.
function facadeGlass(k){
 const m=k.glass('#8196a2','#e9d4a4',215),base=m.onBeforeCompile,tex=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);tex.needsUpdate=true;m.map=tex;m.userData.night.intensity=.39;m.userData.zifengFacade=true;
 m.onBeforeCompile=s=>{base(s);s.vertexShader='varying vec2 zfUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nzfUv=uv;');s.fragmentShader='varying vec2 zfUv;\n'+s.fragmentShader;
 s.fragmentShader=s.fragmentShader.replace(/vec2 cell=vec2\(\(vCity.x[\s\S]*?diffuseColor.rgb\*=mix\(.72,1.0,pane\);/,`vec2 cell=zfUv;cell.y+=mod(floor(cell.x),2.0)*.45;
 vec2 fw=max(fwidth(cell),vec2(.004)),f=fract(cell);float seamX=1.0-smoothstep(.025-fw.x*.5,.025+fw.x*.5,min(f.x,1.0-f.x));float seamY=1.0-smoothstep(.018-fw.y*.5,.018+fw.y*.5,min(f.y,1.0-f.y));
 float visible=1.0-smoothstep(.40,.85,max(fw.x,fw.y));float shade=.92+.055*sin(floor(cell.x)*1.39)+.025*cos(floor(cell.y)*.77);
 diffuseColor.rgb*=mix(1.0,shade,visible);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.55,.61,.64),max(seamX*.48,seamY*.28)*visible);
 float rnd=fract(sin(dot(floor(cell),vec2(12.9898,78.233)))*43758.5453);float occupied=step(.83,rnd);float pane=(1.0-seamX)*(1.0-seamY);float wave=.84+.16*sin(cityTime*.32+floor(cell.x)*.6+floor(cell.y)*.21);
 totalEmissiveRadiance*=pane*occupied*wave*cityNight;`);
 };m.customProgramCacheKey=()=> 'zifeng-scales-v1';return m;
}
function rounded(w,d,r,x=0,z=0){
 const pts=[];for(let corner=0;corner<4;corner++){const cx=x+(corner===0||corner===3?1:-1)*(w/2-r),cz=z+(corner<2?1:-1)*(d/2-r);for(let i=0;i<12;i++){const a=corner*Math.PI/2+i/11*Math.PI/2;pts.push([cx+r*Math.cos(a),cz+r*Math.sin(a)]);}}return pts;
}
function body(k,g,p,points,bottom,top,{glass=p.glass,cap=p.silver}={}){
 const n=points.length,length=[0];for(let i=0;i<n;i++)length.push(length.at(-1)+Math.hypot(points[(i+1)%n][0]-points[i][0],points[(i+1)%n][1]-points[i][1]));
 // Every facade segment has an outward normal and continuous sampling around the bend.
 for(let i=0;i<n;i++){const a=points[i],b=points[(i+1)%n],o=skin(k,g,(u,v)=>[a[0]+(b[0]-a[0])*u,bottom+(top-bottom)*v,a[1]+(b[1]-a[1])*u],1,1,glass);o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute([length[i]/.017,bottom/.020,length[i+1]/.017,bottom/.020,length[i]/.017,top/.020,length[i+1]/.017,top/.020],2));}
 const shape=new THREE.Shape(points.map(a=>new THREE.Vector2(a[0],-a[1]))),roof=k.mesh(g,new THREE.ShapeGeometry(shape),cap);roof.rotation.x=-Math.PI/2;roof.position.y=top;
 return points;
}
function band(k,g,points,y,mat,r=.0012){k.line(g,points.map(a=>[a[0],y,a[1]]),r,mat,true);}
export function zifeng(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.59,.55);paving(k,g,p,.48,.41);
 p.glass=facadeGlass(k);p.silver=k.mat('#acb8bb',.42,.43);p.dark=k.mat('#35434b',.55,.18);p.dark.userData.zifengRecess=true;
 p.light=k.mat('#b5a991',.60,.15,'#eed5a1');p.light.userData.night.intensity=.58;p.light.userData.pulse={speed:.23,phase:.4};
 p.pane=k.mat('#53636c',.42,.23,'#e7d7b8');p.pane.userData.night.intensity=.035;
 const lower=rounded(.315,.245,.064,-.046,.010),upper=rounded(.348,.255,.066,-.025,-.008),blade=rounded(.076,.215,.028,.146,-.017),core=rounded(.252,.179,.046,-.025,-.007);
 body(k,g,p,rounded(.47,.34,.075),.027,.073,{glass:p.dark});
 body(k,g,p,lower,.073,.620);body(k,g,p,core,.620,.705,{glass:p.dark});body(k,g,p,upper,.705,1.147);body(k,g,p,blade,.074,1.279);
 // Louvers, round columns and diagonals retain depth without opening a hole through the tower.
 for(let j=0;j<8;j++)band(k,g,core,.626+j*.009,p.silver,.00085);
 for(const x of [-.15,-.09,-.03,.03,.09])k.cyl(g,.0022,.0022,.085,p.silver,x,.6625,.112,10);
 for(const z of [-.086,-.015,.056])k.cyl(g,.0022,.0022,.085,p.silver,-.19,.6625,z,10);
 for(const y of [.10,.635,.91,1.18]){k.box(g,.033,.076,.006,p.dark,.103,y,-.126);k.beam(g,[.086,y-.032,-.131],[.118,y+.032,-.131],.002,p.silver);}
 band(k,g,lower,.619,p.light,.0018);band(k,g,upper,.707,p.light,.0016);band(k,g,upper,1.145,p.silver,.0015);
 for(let j=0;j<13;j++)band(k,g,blade,1.002+j*.021,p.silver,.0009);
 // The top is a curved fin, a rounded service crown and a joined slender mast.
 const crownGroup=new THREE.Group();g.add(crownGroup);const crown=rounded(.13,.13,.055,-.035,-.025);body(k,crownGroup,p,crown,1.147,1.322,{glass:p.pane});
 for(let j=0;j<=17;j++)band(k,crownGroup,crown,1.149+j*.010,p.silver,.0010);
 for(const y of [1.155,1.245,1.319])band(k,crownGroup,crown,y,p.light,.0013);
 crownGroup.updateMatrixWorld(true);for(const o of crownGroup.children){if(!o.isMesh)continue;o.geometry.applyMatrix4(o.matrix);o.position.set(0,0,0);o.rotation.set(0,0,0);const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const t=Math.max(0,Math.min(1,(a.getY(i)-1.147)/.175));a.setY(i,a.getY(i)-t*.028*(a.getZ(i)+.025)/.065);}o.geometry.computeVertexNormals();}
 k.cyl(g,.004,.007,.465,p.silver,.035,1.377,-.028,16);
 k.beam(g,[.035,1.49,-.028],[.035,1.606,-.028],.0016,p.light);
 for(const y of [1.18,1.235,1.291])k.line(g,[[-.008,y,-.025],[.013,y+.007,-.025],[.035,y+.012,-.028]],.003,p.silver);
 const mastFin=rounded(.022,.038,.009,.035,-.028);body(k,g,p,mastFin,1.39,1.49,{glass:p.pane});for(let j=0;j<=10;j++)band(k,g,mastFin,1.39+j*.010,p.silver,.00085);
 k.cyl(g,.0012,.0016,.018,p.light,.035,1.616,-.028,8);
 // Low curved retail wing and a recessed entrance canopy meet the tower podium.
 const wing=rounded(.26,.29,.070,-.26,.085);body(k,g,p,wing,.031,.240,{glass:p.pane});for(let j=0;j<=9;j++)band(k,g,wing,.036+j*.022,p.silver,.0012);
 for(let i=0;i<wing.length;i+=4){const a=wing[i];k.beam(g,[a[0],.033,a[1]],[a[0],.24,a[1]],.0014,p.silver);}
 k.box(g,.17,.008,.095,p.silver,.018,.112,.169);k.box(g,.14,.062,.005,p.pane,.018,.071,.129);for(const x of [-.043,.018,.079])k.box(g,.002,.062,.009,p.silver,x,.071,.134);
 for(const y of [.040,.228])band(k,g,wing,y,p.light,.0015);
 grove(k,g,ground,[[-.40,-.28,.10],[.34,.27,.10],[.34,-.28,.10]]);
 return finish(k,g,{lamps:[[-.25,.32],[.24,.32]],visitors:[[.08,.26],[-.10,.27]]});
}
