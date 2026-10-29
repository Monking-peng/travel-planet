import * as THREE from 'three';
import {artMuseum,expoArena} from './shanghai-expo.js';
import {waibaidu,wukang} from './shanghai-oldtown.js';
import {yuyuan} from './shanghai-yuyuan.js';
import {jingan} from './shanghai-jingan.js';
import {disney} from './shanghai-disney.js';
import {astronomy} from './shanghai-astronomy.js';
import {cathedral} from './shanghai-cathedral.js';
import {nanpu} from './shanghai-nanpu.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const LANDMARKS = [
  {id:'pearl',name:'东方明珠',area:'陆家嘴 · 滨江',x:.19,z:-.77,height:468/632*1.32,description:'三根支柱托起大小不同的球体，红色玻璃环带和细长天线构成滨江轮廓。夜间保留白天的浅色结构与红色玻璃，以柔和白光和少量暖色灯点照明。',source:'https://english.shanghai.gov.cn/en-ScenicSpots/20231205/19a5f5184eca45728fd57a4d4c8efc61.html'},
  {id:'tower',name:'上海中心',area:'陆家嘴 · 摩天楼群',x:1.02,z:.63,height:1.32,description:'玻璃塔身逐层收窄并扭转，连续的螺旋线条一直延伸至塔冠。',source:'https://www.gensler.com/projects/shanghai-tower'},
  {id:'swfc',name:'环球金融中心',area:'陆家嘴 · 摩天楼群',x:1.22,z:-.38,height:492/632*1.32,description:'方形塔体被两侧弧面削切，顶部的梯形空中门户保留真实开口。',source:'https://www.kpf.com/project/shanghai-world-financial-center'},
  {id:'jinmao',name:'金茂大厦',area:'陆家嘴 · 摩天楼群',x:.57,z:.03,height:421/632*1.32,description:'八角塔身层层退台，金属构件、密集横向线条和尖塔冠呼应传统塔式建筑。',source:'https://www.som.com/projects/jin-mao-tower/'},
  {id:'peace',name:'和平饭店',area:'外滩 · 南京东路',x:-.65,z:-.64,height:.362,description:'灰褐色石材立面逐层退台，绿色铜皮金字塔顶是这座装饰艺术建筑的标志。',source:'https://service.shanghai.gov.cn/sheninfo/specialdetail.aspx?Id=53fcda72-b6ba-4c67-8861-d567d0257cc8'},
  {id:'customs',name:'海关大楼',area:'外滩 · 钟楼',x:-.49,z:-.04,height:.386,description:'厚重的石材基座、贯通立面的壁柱和四面钟楼，共同组成外滩沿江轮廓。',source:'https://www.molon.de/galleries/China/Shanghai/Bund/img.php?pic=10'},
  {id:'hsbc',name:'原汇丰银行大楼',area:'外滩 · 古典建筑',x:-.42,z:.54,height:.283,description:'宽阔的对称立面、爱奥尼式柱廊和中央穹顶，与相邻钟楼形成外滩的经典组合。',source:'https://www.molon.de/galleries/China/Shanghai/Bund/img.php?pic=10'},
  {id:'waibaidu',name:'外白渡桥',area:'苏州河 · 河口',x:-.48,z:-.9965,height:.106,grounded:true,view:[-1,.70,.3],distance:1.15,description:'两跨驼峰形钢桁架连接苏州河两岸，交叉钢梁、顶部横撑与中央桥墩保留通透结构。',source:'https://commons.wikimedia.org/wiki/File:Waibaidu_Bridge_20250501-1.jpg'},
  {id:'huxinting',name:'豫园 · 园林与湖心亭',area:'老城厢 · 九曲桥',x:-1.49,z:.51,height:.35,grounded:true,view:[.15,1.05,1],distance:2.35,description:'湖心亭与九曲桥之外，补入三穗堂、仰山堂和卷雨楼、点春堂、曲廊、水院及黄石大假山，呈现层层相连的园林空间。此处为压缩组合，旅行目录仍仅包含商城公共区域。',source:'https://english.shanghai.gov.cn/en-UniqueExperience-travelinshanghai/20250729/25cfb8bce97d4e798f99ac62986255ff.html'},
  {id:'wukang',name:'武康大楼',area:'衡复街区 · 街角',x:-1.62,z:-.74,height:.305,grounded:true,view:[-.8,.45,1.25],distance:1.4,description:'沿街展开的红砖楼体收成船头形尖角，底层拱廊、连续窗带与浅色檐口刻画出武康路的街角轮廓。',source:'https://commons.wikimedia.org/wiki/File:20191027_Wukang_Mansion.jpg'},
  {id:'artMuseum',name:'中华艺术宫',area:'世博滨江 · 中国馆',x:1.50,z:.85,hemisphere:-1,height:.256,grounded:true,view:[.62,.45,.80],distance:1.55,sceneryOnly:true,description:'上海美术馆（中华艺术宫）的红色冠体由四组支柱托起，横梁层层向外出挑，宽阔台阶通向开敞门厅。',source:'https://commons.wikimedia.org/wiki/File:China_Art_Museum_(9540048707).jpg'},
  {id:'expoArena',name:'梅赛德斯-奔驰文化中心',area:'世博滨江 · 文化中心',x:.76,z:1.51,hemisphere:-1,height:.215,grounded:true,view:[.26,.42,.966],distance:1.6,sceneryOnly:true,description:'乳白色金属屋盖悬挑于玻璃大厅之上，倾斜支柱、分层平台和入口台阶让碗形场馆落在滨江坡地上。',source:'https://commons.wikimedia.org/wiki/File:Expo_Culture_Center_Shanghai_1.JPG'},
  {id:'jingan',name:'静安寺',area:'静安 · 金顶殿堂',x:-.83,z:-1.62,height:.59,focusY:.17,grounded:true,view:[.48,.85,1],distance:2.05,description:'金顶主殿、深灰色重檐、两侧殿堂和后方高塔围合出庭院，中央保留青铜香炉。街区行程仅安排外观，不含入寺门票。',source:'https://commons.wikimedia.org/wiki/File:静安寺·上海静安区.jpg'},
  {id:'disney',name:'上海迪士尼 · 城堡与园区',area:'浦东 · 迪士尼',x:-.15,z:-1.00,hemisphere:-1,height:1.08,focusY:.30,grounded:true,view:[0,.80,1],distance:5.6,sceneryOnly:true,description:'星球另一面的独立乐园：粉砖城堡、蓝灰塔尖与金色塔冠，连接曲径花园、旋转木马、创极速光轮和漂流岩池。造型参照实拍，园区为压缩景观组合，尚未纳入行程。',source:'https://sites.disney.com/waltdisneyimagineering/enchanted-storybook-castle/'},
  {id:'astronomy',name:'上海天文馆',area:'临港 · 天文与建筑',x:1.78,z:-.43,hemisphere:-1,height:.34,focusY:.18,grounded:true,view:[-.7,.95,1.1],distance:3.0,sceneryOnly:true,description:'悬挑的椭圆屋盖、入口圆洞、半嵌的球幕和下凹玻璃穹顶，组成银灰色的轨道形建筑。场地为星球上的压缩组合，尚未纳入旅行排程。',source:'https://ennead.com/work/shanghai-astronomy-museum/'},
  {id:'cathedral',name:'徐家汇天主堂',area:'徐家汇 · 红砖双塔',x:-1.55,z:.65,hemisphere:-1,height:.685,focusY:.28,grounded:true,view:[.64,.53,1.2],distance:2.8,sceneryOnly:true,description:'红砖双塔、灰绿色尖顶、玫瑰窗和尖拱门围绕十字形殿堂展开，夜间以暖色檐光和彩窗照明保留建筑轮廓。作为景观展示，尚未纳入旅行排程。',source:'https://commons.wikimedia.org/wiki/File:Cathedral_in_Xujiahui.jpg'},
  {id:'nanpu',name:'南浦大桥',area:'黄浦江 · 斜拉桥',x:-.174,z:1.74,height:.465,focusY:.125,grounded:true,view:[-.45,.9,1.2],distance:3.0,sceneryOnly:true,description:'两座白色桥塔、成排斜拉索和浦西螺旋引桥连接黄浦江两岸。比例与位置为星球构图压缩，不作为步行过江路线。',source:'https://commons.wikimedia.org/wiki/File:Nanpu_Bridge_2.jpg'},

];

// Preserve the height ratios of the four towers while increasing their visual presence.
const MODEL_SCALE={pearl:1.30,tower:1.30,swfc:1.30,jinmao:1.30,peace:1.30,customs:1.30,hsbc:1.30,wukang:1.34,artMuseum:1.30,huxinting:1.18,jingan:1.16,expoArena:1.15};
for(const item of LANDMARKS){if(MODEL_SCALE[item.id]){item.height*=MODEL_SCALE[item.id];if(item.distance)item.distance*=MODEL_SCALE[item.id];if(item.focusY)item.focusY*=MODEL_SCALE[item.id];}}

// Materials and geometry are authored locally. Reference photographs are not bundled.
export function makeKit(clock) {
  const materials=[];
  function mat(color,roughness=.72,metalness=.08,night=null){
    const m=new THREE.MeshStandardMaterial({color,roughness,metalness});
    if(night)m.userData.night={color:new THREE.Color(night),intensity:.18};
    materials.push(m);return m;
  }
  function glass(color,light,seed){
    const m=mat(color,.31,.34);m.userData.night={color:new THREE.Color(light),intensity:1.35};
    m.onBeforeCompile=s=>{
      s.uniforms.cityTime=clock.time;s.uniforms.cityNight=clock.night;
      s.vertexShader='varying vec3 vCity;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCity = position;');
      s.fragmentShader='uniform float cityTime; uniform float cityNight; varying vec3 vCity;\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        vec2 cell=vec2((vCity.x+vCity.z)*100.0,vCity.y*106.0);
        vec2 f=fract(cell);
        float pane=step(.19,f.x)*step(f.x,.82)*step(.20,f.y)*step(f.y,.76);
        float rnd=fract(sin(dot(floor(cell),vec2(12.9898,78.233))+${seed.toFixed(1)})*43758.5453);
        float pulse=.25+.75*(.5+.5*sin(cityTime*1.5-floor(cell.y)*.23+${seed.toFixed(1)}));
        float sweep=.15+.85*smoothstep(-.25,.75,sin(vCity.y*13.0-cityTime*1.65+${seed.toFixed(1)}));
        float occupied=step(.58,rnd);
        float mechanical=1.0-step(.91,fract(vCity.y*7.0));
        totalEmissiveRadiance*=pane*(occupied*.28+(.50+.50*occupied)*pulse*sweep)*mechanical*cityNight;
        diffuseColor.rgb*=mix(.72,1.0,pane);
      `);
    };
    m.customProgramCacheKey=()=>`shanghai-windows-${seed}`;return m;
  }
  function mesh(g,geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;}
  const box=(g,w,h,d,m,x=0,y=0,z=0)=>mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,rt,rb,h,m,x=0,y=0,z=0,n=24)=>mesh(g,new THREE.CylinderGeometry(rt,rb,h,n),m,x,y,z);
  const ball=(g,r,m,x=0,y=0,z=0)=>mesh(g,new THREE.SphereGeometry(r,32,20),m,x,y,z);
  function beam(g,a,b,r,m,n=6){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const o=cyl(g,r,r,av.distanceTo(bv),m,0,0,0,n);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize());return o;}
  function line(g,points,r,m,closed=false){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed);return mesh(g,new THREE.TubeGeometry(c,Math.max(16,points.length*2),r,4,closed),m);}
  const ring=(g,r,t,m,y=0)=>{const o=mesh(g,new THREE.TorusGeometry(r,t,5,64),m,0,y,0);o.rotation.x=Math.PI/2;return o;};
  function merge(g){
    g.updateMatrixWorld(true);const buckets=new Map(),old=[];
    g.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo.deleteAttribute('uv');const a=buckets.get(o.material)||[];a.push(geo);buckets.set(o.material,a);old.push(o.geometry);});
    g.clear();for(const [m,geos] of buckets){const mixed=geos.some(x=>!x.index)&&geos.some(x=>x.index),compatible=mixed?geos.map(x=>x.index?x.toNonIndexed():x):geos;const geo=mergeGeometries(compatible);const o=mesh(g,geo,m);o.castShadow=true;o.receiveShadow=true;new Set([...geos,...compatible]).forEach(x=>x.dispose());}old.forEach(x=>x.dispose());return g;
  }
  return {mat,glass,mesh,box,cyl,ball,beam,line,ring,merge,materials};
}

function shanghaiTower(k){
  const g=new THREE.Group(),glass=k.glass('#779aa6','#b9d4ed',1),silver=k.mat('#8ea7aa',.38,.5),light=k.mat('#b5cdd0',.4,.2,'#99cfff');light.userData.night.intensity=1.25;light.userData.pulse={phase:0,speed:.82};light.userData.night.alternateColor=new THREE.Color('#e1edff');
  function pt(t,a){const theta=a+t*Math.PI*2/3+.3,r=.125*(1-.45*t)*(1+.12*Math.cos(3*a));return [r*Math.cos(theta),t*1.32,r*Math.sin(theta)];}
  const positions=[],indices=[],N=54,H=60;
  for(let j=0;j<=H;j++)for(let i=0;i<=N;i++)positions.push(...pt(j/H,i/N*Math.PI*2));
  for(let j=0;j<H;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();k.mesh(g,geo,glass);
  for(let i=0;i<36;i++){const points=Array.from({length:41},(_,j)=>pt(j/40,i/36*Math.PI*2));k.line(g,points,i%12===0?.0020:.00055,i%12===0?light:silver);}
  for(let j=1;j<100;j++)k.line(g,Array.from({length:54},(_,i)=>pt(j/100,i/54*Math.PI*2)),j%11===0?.0013:.00045,silver,true);
  const crown=Array.from({length:54},(_,i)=>pt(1,i/54*Math.PI*2));k.line(g,crown,.0028,light,true);
  for(let i=0;i<54;i++){const a=i/54*Math.PI*2,p=pt(1,a),q=pt(.95,a);p[1]+=.018*(1+Math.sin(a));k.beam(g,q,p,.0008,light);}
  k.cyl(g,.045,.054,.017,glass,0,1.308);
  k.cyl(g,.15,.16,.024,k.mat('#c6c8be'),0,.012,0,48);
  return k.merge(g);
}

function swfc(k){
  const g=new THREE.Group(),h=492/632*1.32,glass=k.glass('#7898aa','#68b1e7',2),edge=k.mat('#c7d1cf',.35,.55,'#abcce7');
  // Extruded portal is a real hole through the tower, visible from both sides.
  const shape=new THREE.Shape();shape.moveTo(-.105,0);shape.lineTo(.105,0);shape.lineTo(.074,h);shape.lineTo(-.074,h);shape.closePath();
  const hole=new THREE.Path();hole.moveTo(-.048,h-.035);hole.lineTo(.048,h-.035);hole.lineTo(.033,h-.15);hole.lineTo(-.033,h-.15);hole.closePath();shape.holes.push(hole);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:false,steps:1});geo.translate(0,0,-.0425);
  const position=geo.attributes.position;for(let i=0;i<position.count;i++){const t=position.getY(i)/h;position.setZ(i,position.getZ(i)*(1+1.30*(1-t)));}geo.computeVertexNormals();k.mesh(g,geo,glass);
  edge.userData.night.intensity=.85;edge.userData.pulse={phase:1.4,speed:.78};edge.userData.night.alternateColor=new THREE.Color('#578bff');
  for(const side of [-1,1]){
    for(const sign of [-1,1])k.line(g,Array.from({length:32},(_,i)=>{const t=i/31;return [side*(.105-.031*t),h*t,sign*(.0435*(1+1.30*(1-t)))];}),.0018,edge);
    k.beam(g,[side*.049,h-.034,-.045],[side*.034,h-.151,-.045],.0021,edge);
    k.beam(g,[side*.049,h-.034,.045],[side*.034,h-.151,.045],.0021,edge);
  }
  for(const y of [h-.033,h-.152,h])k.box(g,y===h?.151:.099,.0035,.094,edge,0,y);
  const mullion=k.mat('#9baeb4',.45,.3);for(let y=.015;y<h-.16;y+=.012){const t=y/h,w=.21-.062*t,d=.087*(1+1.30*(1-t));k.box(g,w,.00065,d,mullion,0,y);}
  // Broad faces are gently carved towards the narrow crown.
  for(const side of [-1,1])for(const col of [-.6,-.3,0,.3,.6])k.line(g,Array.from({length:24},(_,i)=>{const t=i/23*.84;return [col*(.105-.031*t),t*h,side*.0435*(1+1.30*(1-t))];}),.0006,mullion);
  k.box(g,.24,.025,.14,k.mat('#c0c4bc'),0,.0125);return k.merge(g);
}

function jinmao(k){
  const g=new THREE.Group(),h=421/632*1.32,glass=k.glass('#9caaab','#dbdcce',3),metal=k.mat('#b8b8ac',.47,.3,'#c6c6b9');
  const crown=k.mat('#d2c7a7',.42,.33,'#ffe0a1');crown.userData.night.intensity=.9;crown.userData.pulse={phase:2.6,speed:.65,min:.74};
  let y=0;const levels=13,body=h*.88;
  for(let i=0;i<levels;i++){
    const dh=body*(i<5?.105:.059375),r=.109*(1-.052*i);k.cyl(g,r,r,dh,glass,0,y+dh/2,0,8);
    for(let s=1;s<=4;s++)k.cyl(g,r+.003,r+.003,.0025,metal,0,y+dh*s/4,0,8);
    k.cyl(g,r+.006,r+.003,.006,metal,0,y+dh-.002,0,8);
    for(let j=0;j<8;j++){const a=j*Math.PI/4;k.beam(g,[Math.sin(a)*r,y,Math.cos(a)*r],[Math.sin(a)*r,y+dh,Math.cos(a)*r],.0026,metal);}
    for(let j=0;j<4;j++){const a=j*Math.PI/2+Math.PI/8,fin=k.box(g,.009,dh*.82,.005,metal,Math.sin(a)*(r+.001),y+dh*.46,Math.cos(a)*(r+.001));fin.rotation.y=a;}
    y+=dh;
  }
  k.cyl(g,.01,.034,h*.07,crown,0,y+h*.035,0,8);k.cyl(g,0,.006,h*.05,crown,0,y+h*.095,0,8);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;k.beam(g,[Math.sin(a)*.045,y-.015,Math.cos(a)*.045],[Math.sin(a)*.012,y+h*.075,Math.cos(a)*.012],.0018,crown);}
  k.cyl(g,.131,.138,.02,k.mat('#bbbbb0'),0,.01,0,8);return k.merge(g);
}

function pearl(k){
  const g=new THREE.Group(),h=468/632*1.32;
  // Keep the daytime finishes at night; architectural lights do not repaint the tower.
  const stone=k.mat('#cfc9bc',.62,.15,'#ded9cf'),shell=k.mat('#cfc9bc',.62,.15,'#ded9cf'),rose=k.mat('#a33542',.35,.32,'#a33542'),dark=k.mat('#64434b',.42,.3,'#f2ddbc'),antenna=k.mat('#cfc9bc',.62,.15,'#ded9cf');
  for(const [m,role,intensity] of [[stone,'structure',.22],[shell,'shell',.28],[rose,'glass',.08],[dark,'ring',.35],[antenna,'antenna',.24]]){
    m.userData.pearlLighting=role;m.userData.night.intensity=intensity;
  }
  // Steady neutral illumination preserves volume; only the small lamps breathe.
  for(const m of [stone,shell,rose]){
    const floor=m===rose?.30:m===shell?.10:.06;
    m.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 pearlNormal;\n'+shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\npearlNormal=objectNormal;');
      shader.fragmentShader='varying vec3 pearlNormal;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\ntotalEmissiveRadiance *= ${floor.toFixed(2)} + ${(1-floor).toFixed(2)} * pow(max(0.0, dot(normalize(pearlNormal), normalize(vec3(-.45,-.75,.40)))), .8);`);
    };
    m.customProgramCacheKey=()=> 'pearl-layered-uplight-'+m.userData.pearlLighting;
  }
  const stud=k.mat('#bd7966',.5,.15,'#ffe2b4');stud.userData.pearlLighting='stud';stud.userData.night.intensity=.90;stud.userData.pulse={phase:4.1,speed:.55,min:.82};
  const lower=h*93/468,upper=h*272.5/468;
  const unit=h/468;
  k.cyl(g,.15,.16,.026,k.mat('#cdcabc'),0,.013,0,48);
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3,s=Math.sin(a),c=Math.cos(a);
    k.beam(g,[s*.025,.025,c*.025],[s*.025,upper,c*.025],.014,stone,12);
    k.beam(g,[s*.115,.025,c*.115],[s*.025,lower,c*.025],.013,stone,12);
    k.ball(g,.017,stone,s*.068,lower*.49,c*.068);
  }
  for(const [y,r] of [[lower,25*unit],[upper,22.5*unit],[h*342/468,7*unit]]){
    k.ball(g,r,shell,0,y);
    k.mesh(g,new THREE.SphereGeometry(r*1.006,40,14,0,Math.PI*2,.83,1.48),rose,0,y);
    for(const sign of [-1,1])k.ring(g,r*.94,.0014,dark,y+sign*r*.35);
    for(let row=0;row<4;row++)for(let col=0;col<24;col++){
      const p=.97+row*.39,a=(col+(row%2)*.5)*Math.PI/12;
      k.mesh(g,new THREE.SphereGeometry(r*.015,6,4),stud,Math.sin(p)*Math.cos(a)*r*1.014,y+Math.cos(p)*r*1.014,Math.sin(p)*Math.sin(a)*r*1.014);
    }
    for(let i=0;i<20;i++){const a=i*Math.PI/10;const pts=[];for(let j=0;j<=10;j++){const p=Math.PI*.32+Math.PI*.36*j/10;pts.push([r*1.013*Math.sin(p)*Math.cos(a),y+r*Math.cos(p),r*1.013*Math.sin(p)*Math.sin(a)]);}k.line(g,pts,.0007,stone);}
  }
  for(let i=0;i<5;i++){const y=lower+.082+i*.051;k.cyl(g,.017,.017,.012,rose,0,y);k.ring(g,.019,.0018,stone,y+.006);}
  k.cyl(g,.010,.014,h*(342-272.5)/468,stone,0,h*(342+272.5)/936);
  k.cyl(g,.002,.007,h*(468-342)/468,antenna,0,h*(468+342)/936,0,12);
  for(let y=h*.80;y<h;y+=.022)k.cyl(g,.0035,.0035,.008,rose,0,y,0,8);
  return k.merge(g);
}

function bund(k,kind){
  const g=new THREE.Group(),stone=k.mat(kind==='peace'?'#b5a587':'#c9be9e',.9,.02),trim=k.mat('#e0d3b3',.75,.04),shadow=k.mat('#716d5e'),window=k.mat('#3e535c',.33,.25,'#e3bc7b'),roof=k.mat('#37634f',.66,.25),wash=k.mat('#ded0a8',.68,.05,'#ffb857'),gold=k.mat('#d0bc85',.6,.08,'#ffbd63');
  window.userData.night.intensity=.36;wash.userData.night.intensity=.65;gold.userData.night.intensity=1.15;gold.userData.pulse={phase:kind==='peace'?0:kind==='customs'?1.7:3.4,speed:.55,min:.82};
  function facade(w,h,d,y=0,cols=9,rows=5){
    k.box(g,w,h,d,stone,0,y+h/2);
    // Recess, lintel, sill and side jambs on all four sides, not printed window dots.
    for(let side=0;side<4;side++){
      const face=new THREE.Group();face.rotation.y=side*Math.PI/2;g.add(face);
      const width=side%2?d:w,depth=side%2?w:d,count=side%2?Math.max(3,Math.round(cols*d/w)):cols,step=width/(count+.7),ww=step*.46,hh=h/(rows+1)*.64,z=depth/2+.0007;
      for(let row=0;row<rows;row++)for(let col=0;col<count;col++){
        const x=(col-(count-1)/2)*step,yy=y+(row+.7)*h/(rows+.15);
        k.box(face,ww+.003,hh+.004,.002,shadow,x,yy,z);
        k.box(face,ww,hh,.002,window,x,yy,z+.0012);
        for(const sign of [-1,1])k.box(face,.0016,hh+.005,.004,trim,x+sign*(ww/2+.001),yy,z+.002);
        k.box(face,ww+.006,.002,.005,row===rows-1?wash:trim,x,yy+hh/2+.002,z+.003);
        k.box(face,ww+.006,.002,.005,trim,x,yy-hh/2-.002,z+.002);
        k.box(face,.001,hh,.002,trim,x,yy,z+.003);k.box(face,ww,.001,.002,trim,x,yy+.001,z+.003);
      }
      for(let i=0;i<=count;i++){const x=(i-count/2)*step;k.box(face,.0035,.007,.004,wash,x,y+h+.009,z+.004);}
    }
    for(const [dy,wide,thick,mat] of [[0,.006,.004,trim],[h-.008,.010,.003,wash],[h,.018,.007,trim],[h+.006,.012,.003,wash]])k.box(g,w+wide,thick,d+wide,mat,0,y+dy);
    // Rusticated ground storey and stone quoins have restrained relief.
    if(y===0){for(let i=1;i<5;i++)k.box(g,w+.002,.0008,d+.002,shadow,0,i*.005);for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])for(let yy=.008;yy<h;yy+=.015)k.box(g,.008,.007,.008,trim,x,yy,z);}
  }
  function column(x,z,y,h,r=.004){
    k.cyl(g,r,r*1.12,h,wash,x,y+h/2,z,12);k.box(g,r*3.1,.005,r*3.1,trim,x,y+h,z);k.cyl(g,r*1.45,r*1.6,.005,trim,x,y,z,12);
    for(const side of [-1,1]){const volute=k.mesh(g,new THREE.TorusGeometry(.0023,.0007,4,10),trim,x+side*r*1.05,y+h-.0005,z+r*1.65);volute.rotation.y=0;}
  }
  if(kind==='peace'){
    facade(.29,.17,.20,0,9,7);facade(.19,.047,.16,.17,6,2);facade(.135,.027,.13,.217,4,1);
    const pyramid=k.cyl(g,0,.095,.075,roof,0,.2815,0,4);pyramid.rotation.y=Math.PI/4;
    for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;k.beam(g,[Math.cos(a)*.095,.244,Math.sin(a)*.095],[0,.319,0],.001,trim);}
    for(let i=-3;i<=3;i++)column(i*.035,.106,.006,.041);
    k.box(g,.074,.007,.025,gold,0,.052,.113);k.box(g,.028,.031,.003,window,0,.021,.107);
    k.box(g,.019,.018,.019,roof,0,.329);k.beam(g,[0,.338,0],[0,.362,0],.0015,gold);
  }else if(kind==='customs'){
    facade(.29,.167,.18,0,8,6);
    for(let i=-3;i<=3;i++){k.box(g,.009,.116,.013,wash,i*.037,.096,.101);k.box(g,.015,.006,.017,trim,i*.037,.155,.103);k.box(g,.008,.003,.009,gold,i*.037,.037,.11);}
    facade(.099,.047,.091,.167,3,2);k.box(g,.108,.082,.102,stone,0,.255);
    for(let side=0;side<4;side++){
      const face=new THREE.Group();face.rotation.y=side*Math.PI/2;g.add(face);
      const disk=k.cyl(face,.032,.032,.002,wash,0,.263,.052,40);disk.rotation.x=Math.PI/2;
      const rim=k.mesh(face,new THREE.TorusGeometry(.033,.0014,5,48),gold,0,.263,.054);
      for(let i=0;i<12;i++){const a=i*Math.PI/6,tick=k.box(face,.0015,.005,.002,shadow,Math.sin(a)*.025,.263+Math.cos(a)*.025,.054);tick.rotation.z=-a;}
      k.beam(face,[0,.263,.056],[.014,.279,.056],.0012,shadow);k.beam(face,[0,.263,.056],[-.012,.259,.056],.0016,shadow);
      for(const x of [-.047,.047])k.box(face,.006,.076,.008,gold,x,.255,.052);
    }
    k.box(g,.117,.009,.109,gold,0,.299);k.cyl(g,.031,.047,.032,roof,0,.319,0,4);k.box(g,.025,.022,.025,wash,0,.343);k.beam(g,[0,.354,0],[0,.386,0],.0015,trim);
  }else{
    facade(.35,.12,.20,0,12,4);facade(.23,.032,.17,.12,8,1);
    for(let i=-3;i<=3;i++)column(i*.033,.113,.018,.079,.005);
    k.box(g,.245,.009,.026,wash,0,.103,.113);k.box(g,.245,.004,.032,trim,0,.11,.113);
    k.cyl(g,.065,.065,.049,stone,0,.1765,0,24);
    for(let i=0;i<16;i++){const a=i*Math.PI/8;k.cyl(g,.003,.003,.043,wash,Math.cos(a)*.065,.1765,Math.sin(a)*.065,8);}
    const dome=k.mesh(g,new THREE.SphereGeometry(.072,48,18,0,Math.PI*2,0,Math.PI/2),gold,0,.201);dome.scale.y=.66;
    for(let i=0;i<16;i++){const a=i*Math.PI/8;const pts=Array.from({length:15},(_,j)=>{const t=j/14*Math.PI/2;return [.0725*Math.sin(t)*Math.cos(a),.201+.048*Math.cos(t),.0725*Math.sin(t)*Math.sin(a)];});k.line(g,pts,.0009,trim);}
    k.ring(g,.072,.0022,wash,.201);k.cyl(g,.012,.018,.025,roof,0,.257);k.ball(g,.009,gold,0,.274);
    for(let i=0;i<3;i++)k.box(g,.26+i*.022,.003,.025,trim,0,.004-i*.001,.12+i*.011);
  }
  g.rotation.y=Math.PI/2;g.updateMatrixWorld(true);const merged=k.merge(g);merged.rotation.y=0;return merged;
}

export function createLandmark(id,kit){
  const f={tower:shanghaiTower,swfc,jinmao,pearl,waibaidu,wukang,huxinting:yuyuan,artMuseum,expoArena,jingan,disney,astronomy,cathedral,nanpu};const model=f[id]?f[id](kit):bund(kit,id);
  if(MODEL_SCALE[id]){const scale=MODEL_SCALE[id];model.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position,grounded=LANDMARKS.find(l=>l.id===id).grounded;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),sag=(a,b)=>Math.sqrt(Math.max(.001,1.85**2-a*a-b*b))-1.85;p.setXYZ(i,x*scale,grounded?sag(x*scale,z*scale)+(y-sag(x,z))*scale:y*scale,z*scale);}o.geometry.computeVertexNormals();}});}
  model.name=id;model.userData.landmark=id;model.traverse(o=>{if(o.isMesh)o.userData.landmark=id;});return model;
}
