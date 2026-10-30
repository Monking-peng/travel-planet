import * as THREE from 'three';
import {roof,plaque} from './wuhan-architecture.js';
import {palette,lattice,lantern} from './shunde-kit.js';

// Terraced earth follows the processional route. Courts are thin stone surfaces
// on the hillside, rather than full-height boxes standing above the mountain.
const profile=[[.96,0],[.84,.020],[.36,.245],[.16,.245],[.07,.315],[-.14,.315],[-.27,.475],[-.68,.475],[-.96,0]];
export function templeHeight(x,z){
  let h=0;
  for(let i=0;i<profile.length-1;i++){const [a,ha]=profile[i],[b,hb]=profile[i+1];if(z<=a&&z>=b){h=THREE.MathUtils.lerp(ha,hb,(a-z)/(a-b));break;}}
  const flat=z<-.2?.46:z<.15?.39:.30,fall=1-THREE.MathUtils.smoothstep(Math.abs(x),flat,.79);
  return h*fall*(1-THREE.MathUtils.smoothstep(Math.hypot(x/.79,z/.99),.95,1));
}

export function baolin(k){
  const g=new THREE.Group(),p=palette(k),soil=k.mat('#ffffff',.99),brick=k.mat('#9b9c8a',.96),red=k.mat('#924a41',.88),wood=k.mat('#443d32',.95),green=k.mat('#4e7962',.86),tile=k.mat('#b78657',.90),ivory=k.mat('#d6d2be',.97),stone=k.mat('#b2b19c',.95);
  soil.vertexColors=true;soil.userData.terrainTint=true;
  const positions=[0,templeHeight(0,0)+.001,0],colors=[],indices=[],low=new THREE.Color('#91a18a'),high=new THREE.Color('#6b8056');colors.push(high.r,high.g,high.b);
  for(let j=1;j<=80;j++)for(let i=0;i<=128;i++){
    const angle=i/128*Math.PI*2,r=j/80,x=Math.cos(angle)*r*.79,z=Math.sin(angle)*r*.99,h=templeHeight(x,z),c=low.clone().lerp(high,Math.min(1,h/.16));positions.push(x,h+.001,z);colors.push(c.r,c.g,c.b);
    if(i){const n=1+(j-1)*129+i;if(j===1)indices.push(0,n,n-1);else indices.push(n-130,n-129,n-1,n-129,n,n-1);}
  }
  const land=new THREE.BufferGeometry();land.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));land.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));land.setIndex(indices);land.computeVertexNormals();k.mesh(g,land,soil);
  const courts=[{z:.26,y:.251,w:.60,d:.20},{z:-.035,y:.321,w:.78,d:.21},{z:-.46,y:.481,w:.91,d:.40}];
  for(const {z,y,w,d}of courts){
    k.box(g,w,.012,d,stone,0,y,z);
    // A low curb has short masonry joints; the soil meets its underside.
    for(const side of [-1,1]){
      k.box(g,.012,.018,d,ivory,side*w/2,y+.014,z);
      for(let j=0;j<Math.ceil(d/.025);j++)k.box(g,.013,.001,.001,brick,side*w/2,y+.009,z-d/2+j*.025);
    }
    for(let j=0;j<Math.floor(d/.035);j++)k.box(g,w-.014,.0006,.0008,brick,0,y+.0065,z-d/2+(j+1)*.035);
  }
  const stairSamples=[];
  function flight(start,end,width){
    const n=Math.ceil((start-end)/.014),depth=(start-end)/n;
    for(let i=0;i<n;i++){
      const z=start-(i+.5)*depth,y=templeHeight(0,z-depth/2)+.014,ground=templeHeight(0,z+depth/2),thickness=Math.max(.009,y-ground+.003);
      k.box(g,width,thickness,depth+.0007,stone,0,y-thickness/2,z);stairSamples.push([0,y,z]);
      for(const side of [-1,1]){
        const x=side*(width/2+.01);k.box(g,.012,.022,depth+.001,ivory,x,y+.011,z);
        if(i%4===0){k.cyl(g,.0025,.003,.038,ivory,x,y+.025,z,6);k.ball(g,.004,ivory,x,y+.044,z);}
      }
    }
  }
  flight(.85,.36,.39);flight(.16,.07,.25);flight(-.14,-.27,.25);
  // The long middle relief separates the two stair flights in the reference.
  const relief=[];for(let i=0;i<=28;i++){const z=.79-i*.40/28;relief.push([0,templeHeight(0,z)+.024,z]);}
  for(let i=0;i<relief.length-1;i++){
    const a=new THREE.Vector3(...relief[i]),b=new THREE.Vector3(...relief[i+1]),m=k.box(g,.065,.010,a.distanceTo(b)+.001,brick,...a.clone().add(b).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),b.clone().sub(a).normalize());
  }
  const carving=k.mat('#a7a795',.99);
  for(let group=0;group<4;group++){
    const center=.445+group*.088,points=[];
    for(let i=0;i<18;i++){const a=i/17*Math.PI*2.4,z=center+Math.cos(a)*.029,x=Math.sin(a)*.017;points.push([x,templeHeight(0,z)+.032,z]);}
    k.line(g,points,.0018,carving);
    for(let i=0;i<5;i++){const z=center+(i-2)*.009;k.beam(g,[-.018,templeHeight(0,z)+.031,z],[-.008,templeHeight(0,z+.006)+.031,z+.006],.0012,carving,4);}
  }
  for(const side of [-1,1])k.line(g,relief.map(([x,y,z])=>[x+side*.034,y+.008,z]),.0025,ivory);

  // Three genuinely open portals, with grey masonry and green glazed roof tiles.
  const gateZ=.265,gateY=.263;
  for(const [cx,w,h]of [[-.205,.13,.135],[0,.23,.205],[.205,.13,.135]]){
    const opening=w*.56;
    for(const side of [-1,1]){
      const x=cx+side*(opening/2+(w-opening)/4);k.box(g,(w-opening)/2,h,.083,brick,x,gateY+h/2,gateZ);
      k.box(g,.012,h,.006,ivory,cx+side*(opening/2+.006),gateY+h/2,gateZ+.044);
    }
    k.box(g,w,.040,.083,brick,cx,gateY+h-.020,gateZ);k.box(g,w+.014,.009,.095,ivory,cx,gateY+h+.002,gateZ);
    roof(k,g,w+.075,.15,.049,gateY+h+.010,green,green,cx,gateZ);
    k.box(g,w+.030,.003,.003,p.warm,cx,gateY+h+.009,gateZ+.072);
  }
  plaque(k,g,'宝林寺',.092,.030,0,gateY+.175,gateZ+.044);
  for(const x of [-.126,.126])lantern(k,g,x,gateY+.10,gateZ+.065,p,.007);

  function templeHall({x=0,z,w,d,h,y,double=false,name='',roofMat=tile}){
    k.box(g,w+.030,.020,d+.032,ivory,x,y+.010,z);k.box(g,w*.91,h*.94,d*.82,brick,x,y+.020+h*.47,z);
    for(const side of [-1,1]){
      const front=z+side*d*.46;
      for(let i=0;i<7;i++){const px=x+(i/6-.5)*w*.94;k.cyl(g,.0045,.0055,h,red,px,y+.020+h/2,front,10);k.cyl(g,.007,.008,.015,ivory,px,y+.026,front,8);}
      k.box(g,w*.64,h*.72,.003,wood,x,y+.020+h*.39,z+side*d*.414);
      for(let i=0;i<5;i++)lattice(k,g,x+(i-2)*w*.12,y+.020+h*.40,z+side*d*.420,w*.09,h*.68,wood);
      for(const s of [-1,1]){const ring=k.mesh(g,new THREE.TorusGeometry(h*.18,.0035,5,32),ivory,x+s*w*.36,y+.020+h*.48,z+side*d*.416);k.mesh(g,new THREE.CircleGeometry(h*.16,24),wood,ring.position.x,ring.position.y,ring.position.z+.001);}
      k.box(g,w*1.10,.010,.009,green,x,y+h+.017,z+side*d*.58);k.box(g,w*1.05,.002,.002,p.warm,x,y+h+.016,z+side*d*.59);
    }
    roof(k,g,w*1.18,d*1.23,h*.36,y+h+.023,roofMat,green,x,z);
    // Closure under the ridge and a pierced red upper gallery give the double
    // roof its characteristic layered outline without a glowing solid wall.
    k.box(g,w*.30,.012,.032,roofMat,x,y+h*1.34,z);
    if(double){
      k.box(g,w*.80,h*.27,d*.76,red,x,y+h*1.36,z);
      for(const side of [-1,1])for(let i=0;i<16;i++)k.box(g,.004,h*.12,.002,wood,x+(i/15-.5)*w*.75,y+h*1.37,z+side*d*.386);
      roof(k,g,w*1.01,d*1.02,h*.34,y+h*1.52,roofMat,green,x,z);k.box(g,w*.28,.010,.025,roofMat,x,y+h*1.83,z);
    }
    if(name)plaque(k,g,name,w*.32,.027,x,y+h*.86,z+d*.475);
  }
  templeHall({z:-.045,w:.35,d:.15,h:.13,y:.329,name:'天王殿',roofMat:green});
  templeHall({z:-.48,w:.48,d:.26,h:.19,y:.489,name:'大雄宝殿',double:true});
  // Bell and drum towers are open, square, red-columned structures.
  for(const x of [-.30,.30]){
    const z=-.025,y=.330;k.box(g,.14,.030,.14,brick,x,y+.015,z);
    for(const dx of [-.052,.052])for(const dz of [-.052,.052])k.cyl(g,.004,.005,.16,red,x+dx,y+.11,z+dz,8);
    k.box(g,.15,.008,.15,ivory,x,y+.068,z);
    for(const side of [-1,1]){k.box(g,.14,.004,.004,ivory,x,y+.097,z+side*.068);for(let j=0;j<6;j++)k.box(g,.003,.026,.003,ivory,x+(j/5-.5)*.14,y+.083,z+side*.068);}
    roof(k,g,.18,.18,.055,y+.165,tile,green,x,z);roof(k,g,.13,.13,.055,y+.225,tile,green,x,z);
    if(x<0)k.cyl(g,.018,.027,.040,k.mat('#7d795e',.7,.25),x,y+.13,z,12);else{const drum=k.cyl(g,.022,.022,.028,wood,x,y+.13,z,16);drum.rotation.x=Math.PI/2;}
    k.box(g,.14,.002,.002,p.warm,x,y+.164,z+.085);
  }
  // Low side galleries frame the main courtyard without blocking its stair axis.
  for(const side of [-1,1]){
    const gallery=new THREE.Group(),x=side*.385,z=-.48,y=.489;
    k.box(gallery,.10,.020,.29,ivory,x,y+.010,z);
    for(let i=0;i<8;i++)for(const s of [-1,1])k.cyl(gallery,.003,.004,.105,red,x+s*.04,y+.073,z+(i/7-.5)*.27,8);
    const r=new THREE.Group();roof(k,r,.34,.15,.045,y+.13,tile,green);r.rotation.y=Math.PI/2;r.position.set(x,0,z);gallery.add(r);g.add(gallery);
    k.box(g,.002,.002,.28,p.warm,x-side*.075,y+.128,z);
  }
  const incense=k.mat('#675f43',.72,.2);k.cyl(g,.022,.030,.030,incense,0,.516,-.293,12);for(const s of [-1,1])k.cyl(g,.003,.004,.030,incense,s*.022,.500,-.293,6);
  for(const x of [-.22,.22])for(let i=0;i<4;i++){
    const z=.40+i*.10,y=templeHeight(x,z),h=.075;k.cyl(g,.003,.003,h,wood,x,y+h/2,z,6);
    if(i<3)k.beam(g,[x,y+h,z],[x,templeHeight(x,z+.10)+h,z+.10],.004,wood,6);
  }
  const trees=[],leaves=['#477052','#5b7952','#728456'].map(c=>k.mat(c,.97));
  for(let i=0;i<430;i++){
    const x=-.75+((i*.61803398875)%1)*1.50,z=-.93+((i*.41421356237)%1)*1.86;
    if((x/.75)**2+(z/.94)**2>1)continue;
    const court= courts.some(q=>Math.abs(x)<q.w/2+.065&&Math.abs(z-q.z)<q.d/2+.065);
    if(court||(Math.abs(x)<.265&&z>.10)||(Math.abs(x)<.17&&z>-.30))continue;
    const y=templeHeight(x,z),size=.075+(i%5)*.009;k.cyl(g,.0025,.004,size*.65,wood,x,y+size*.3,z,6);
    for(let j=0;j<4;j++){const a=j*2.4,m=k.mesh(g,new THREE.IcosahedronGeometry(size*.40,1),leaves[i%3],x+Math.cos(a)*size*.18,y+size*(.70+(j%2)*.12),z+Math.sin(a)*size*.18);m.scale.y=1.12;}trees.push([x,y,z]);
  }
  // Side pergolas and warm step markers light the route rather than every surface.
  for(let i=0;i<12;i++)for(const side of [-1,1]){
    const x=side*.23,z=.81-i*.039,y=templeHeight(x,z);k.box(g,.005,.005,.005,p.warm,x,y+.035,z);
  }
  for(const q of courts)for(const side of [-1,1]){const x=side*(q.w/2-.04);k.cyl(g,.002,.003,.040,wood,x,q.y+.025,q.z+q.d/2-.02,6);k.ball(g,.005,p.warm,x,q.y+.048,q.z+q.d/2-.02);}
  g.userData={courts,stairSamples,trees,gate:{z:gateZ,y:gateY,openings:[-.205,0,.205]},main:{z:-.48,y:.489},profile};k.merge(g);
  for(const [x,y,z,intensity]of [[-.18,.65,-.28,.020],[.18,.65,-.28,.020],[0,.44,.065,.015]]){
    const light=new THREE.PointLight('#f6d29c',0,.48,2);light.position.set(x,y,z);light.userData.nightIntensity=intensity;g.add(light);
  }
  return g;
}
