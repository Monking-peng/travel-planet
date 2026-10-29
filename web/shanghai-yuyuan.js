import * as THREE from 'three';
import {huxinting} from './shanghai-oldtown.js';
import {at,sag,groundPatch,groundRect,hall,tiledRoof,gardenTree} from './shanghai-heritage.js';

export function yuyuan(k){
  const g=new THREE.Group(),m={stone:k.mat('#bfb8a4'),wall:k.mat('#e0dac5'),wood:k.mat('#74432f'),window:k.mat('#5b4e38',.4,.12,'#ffce82'),roof:k.mat('#404b48'),ridge:k.mat('#66716a'),light:k.mat('#b6a477',.6,.1,'#efc086')};
  m.window.userData.night.intensity=.50;m.light.userData.night.intensity=.58;
  const water=k.mat('#688f82',.4,.2),rock=k.mat('#9b957b'),rockShade=k.mat('#7c806a'),leaves=k.mat('#607959');
  groundRect(k,g,0,-.10,.98,.84,m.stone);
  // The teahouse remains outside the garden, beside the nine-turn bridge.
  const tea=huxinting(k);tea.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),xx=x*.76+.20,zz=z*.76+.25;p.setXYZ(i,xx,(p.getY(i)-sag(x,z))*.86+sag(xx,zz),zz);}o.geometry.computeVertexNormals();});g.add(tea);
  // Compressed sequence of real garden rooms, not duplicated residential infill.
  hall(k,g,{x:-.22,z:.16,w:.28,d:.13,h:.105},m); // Sansui Hall
  hall(k,g,{x:-.22,z:-.05,w:.25,d:.12,h:.076,levels:2},m); // Yangshan Hall / Juanyu Tower
  hall(k,g,{x:.23,z:-.32,w:.23,d:.14,h:.11},m); // Dianchun Hall
  hall(k,g,{x:.40,z:-.06,w:.15,d:.12,h:.10,rotation:Math.PI/2},m); // Yuhua Hall
  hall(k,g,{x:.05,z:-.08,w:.14,d:.11,h:.075},m); // Waterside room
  const pond=[[-.02,-.22],[.06,-.31],[.21,-.23],[.34,-.24],[.35,-.11],[.28,-.02],[.14,-.01],[.10,-.13]];
  groundPatch(k,g,pond,m.stone,.012);groundPatch(k,g,pond.map(([x,z])=>[.16+(x-.16)*.94,-.16+(z+.16)*.94]),water,.015);
  // Huangshi rockery: two unequal rocky masses, a cleft and a winding ascent.
  for(let i=0;i<38;i++){
    const a=i*2.399,r=.03+Math.sqrt(i/38)*.14,x=-.25+Math.cos(a)*r,z=-.33+Math.sin(a)*r*.61;
    const h=.038+.09*(1-r/.19)+.015*Math.sin(i*3),o=k.mesh(g,new THREE.DodecahedronGeometry(.033+(i%4)*.004,0),i%4?rock:rockShade,x,sag(x,z)+h,z);
    o.scale.set(1,.8+(i%5)*.21,.8);o.rotation.set(i*.2,i*.47,i*.13);
  }
  const ridgePath=Array.from({length:12},(_,i)=>{const t=i/11;return [-.39+t*.26,sag(-.39+t*.26,-.32)+.025+.12*Math.sin(t*Math.PI),-.32+.03*Math.sin(t*8)];});k.line(g,ridgePath,.008,m.stone);
  const pavilion=at(g,-.24,-.32,.16);for(const x of [-.025,.025])for(const z of [-.023,.023])k.cyl(pavilion,.002,.0025,.035,m.wood,x,.0175,z,6);tiledRoof(k,pavilion,.081,.071,.034,.028,m.roof,m.ridge,m.light);
  // Covered zigzag corridors frame the pond and connect the halls.
  function corridor(points){for(let i=1;i<points.length;i++){
    const [x,z]=points[i-1],[xx,zz]=points[i],len=Math.hypot(xx-x,zz-z),a=at(g,(x+xx)/2,(z+zz)/2,0,-Math.atan2(zz-z,xx-x));
    k.box(a,len,.010,.044,m.stone,0,.010);tiledRoof(k,a,len+.015,.060,.065,.018,m.roof,m.ridge,m.light);
    for(let j=0;j<=Math.ceil(len/.04);j++){const px=-len/2+j*len/Math.ceil(len/.04);for(const side of [-1,1]){k.cyl(a,.002,.0025,.058,m.wood,px,.035,side*.019,6);k.box(a,.003,.018,.003,m.stone,px,.024,side*.022);}}
    for(const side of [-1,1])k.box(a,len,.002,.002,m.stone,0,.034,side*.022);
  }}
  corridor([[-.44,.20],[-.44,-.13],[-.37,-.18]]);corridor([[.03,-.30],[.03,-.19],[.10,-.19],[.10,-.07],[.24,-.07]]);corridor([[.34,-.40],[.46,-.40],[.46,-.18]]);
  // White dragon wall with scalloped tile crest. A real opening separates two rooms.
  for(const [x,w] of [[-.35,.22],[.02,.27]]){
    const a=at(g,x,-.17);k.box(a,w,.065,.012,m.wall,0,.034);
    k.line(a,Array.from({length:24},(_,i)=>[-w/2+i*w/23,.072+.010*Math.sin(i*.55),0]),.004,m.roof);
  }
  const gate=at(g,-.15,-.17),shape=new THREE.Shape();shape.moveTo(-.07,0);shape.lineTo(.07,0);shape.lineTo(.07,.12);shape.lineTo(-.07,.12);shape.closePath();const hole=new THREE.Path();hole.absarc(0,.052,.040,0,Math.PI*2,true);shape.holes.push(hole);const gateGeo=new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:false});gateGeo.translate(0,0,-.006);k.mesh(gate,gateGeo,m.wall);const ring=k.mesh(gate,new THREE.TorusGeometry(.042,.003,5,40),m.roof,0,.052,.008);
  for(const [x,z,h] of [[-.43,-.40,.085],[-.04,-.45,.095],[.39,-.40,.070],[-.46,.035,.075],[-.43,.28,.09],[.46,.12,.065],[.08,-.37,.055]])gardenTree(k,g,x,z,h,leaves,m.wood);
  // Taihu stone with holes, viewed through the east-side garden court.
  const jade=at(g,.27,-.14);for(let i=0;i<3;i++){const o=k.mesh(jade,new THREE.TorusGeometry(.020+i*.003,.006,5,9),rock,.012*Math.sin(i*2),.026+i*.025,0);o.rotation.y=i*.70;}k.box(jade,.07,.012,.045,m.stone,0,.006);
  return k.merge(g);
}
