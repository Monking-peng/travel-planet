import * as THREE from 'three';

function radial(k,g,a,r,y,w,h,d,m){const o=k.box(g,w,h,d,m,Math.sin(a)*r,y,Math.cos(a)*r);o.rotation.y=a;return o;}
function stroke(k,g,points,r,m){for(let i=0;i<points.length;i++)k.beam(g,points[i],points[(i+1)%points.length],r,m,4);}
function band(k,g,r,y,h,p,count=36){
  k.cyl(g,r,r,h,p.blue,0,y,0,96);
  for(let i=0;i<count;i++){
    const a=i/count*Math.PI*2,w=2*Math.PI*r/count*.87;
    radial(k,g,a,r+.001,y,w,h*.72,.0018,i%2?p.green:p.blue);
    for(const sy of [-1,1])radial(k,g,a,r+.002,y+sy*h*.39,w,.0015,.002,p.gold);
    const q=new THREE.Group();q.position.set(Math.sin(a)*(r+.003),y,Math.cos(a)*(r+.003));q.rotation.y=a;g.add(q);
    stroke(k,q,[[-w*.4,0,.001],[-w*.18,h*.28,.001],[w*.18,h*.28,.001],[w*.4,0,.001],[w*.18,-h*.28,.001],[-w*.18,-h*.28,.001]],.00065,p.gold);
    k.box(q,w*.40,.0015,.002,p.gold,0,0,.002);k.mesh(q,new THREE.IcosahedronGeometry(.0015,0),p.gold,0,0,.002);
  }
}
function roof(k,g,r,y,h,p){
  const pts=[[0,y+h],[r*.14,y+h*.92],[r*.33,y+h*.60],[r*.60,y+h*.24],[r*.89,y+.002],[r*.985,y+.004],[r,y+.008],[r,y+.003],[r*.89,y-.003],[r*.5,y+.006],[0,y+.006]].map(q=>new THREE.Vector2(...q));
  k.mesh(g,new THREE.LatheGeometry([...pts].reverse(),144),p.tile);
  k.ring(g,r,.0015,p.tile,y+.006);
  for(let i=0;i<96;i++){
    const a=i/96*Math.PI*2,points=pts.slice(1,7).map(q=>[Math.sin(a)*q.x,q.y+.001,Math.cos(a)*q.x]);k.line(g,points,.00065,p.tileRidge);
    const end=k.cyl(g,.0017,.0017,.003,p.tileRidge,Math.sin(a)*r,y+.005,Math.cos(a)*r,8);end.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.sin(a),0,Math.cos(a)));
    radial(k,g,a,r*.95,y-.005,.0025,.005,.009,p.cream);
  }
}
function brackets(k,g,r,y,p){
  for(let i=0;i<48;i++){
    const a=i/48*Math.PI*2,q=new THREE.Group();q.rotation.y=a;g.add(q);
    for(let j=0;j<4;j++){
      const width=.008+j*.004,rr=r+.004+j*.004,yy=y+j*.005;
      k.box(q,width,.003,.008,p.green,0,yy,rr);k.box(q,width,.0007,.0085,p.gold,0,yy+.0017,rr);
      k.box(q,.003,.005,.012,p.blue,0,yy+.003,rr);
      for(const x of [-1,1])k.box(q,.002,.005,.006,p.green,x*width*.42,yy+.002,rr);
    }
  }
}
function verticalPlaque(k,g,p){
  k.box(g,.043,.080,.004,p.gold,0,.418,.129);
  k.box(g,.035,.071,.004,p.blue,0,.418,.132);
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=384;const c=canvas.getContext('2d');c.fillStyle='#1e477d';c.fillRect(0,0,160,384);c.fillStyle='#e6be65';c.textAlign='center';c.textBaseline='middle';c.font='bold 92px "KaiTi","STKaiti",serif';['祈','年','殿'].forEach((t,i)=>c.fillText(t,80,64+i*126));const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const mat=k.mat('#ffffff',.8);mat.map=tex;mat.emissiveMap=tex;mat.userData.night={color:new THREE.Color('#ffffff'),intensity:.13};k.mesh(g,new THREE.PlaneGeometry(.033,.069),mat,0,.418,.135);
  }
  for(const side of [-1,1])for(let i=0;i<13;i++){const yy=.381+i*.006;k.mesh(g,new THREE.TorusGeometry(.0024,.0007,4,12),p.gold,side*.021,yy,.132);}
}
export function prayerHall(k){
  const g=new THREE.Group(),p={red:k.mat('#933e32',.84),dark:k.mat('#383b35',.94),gold:k.mat('#bc974d',.66,.2),blue:k.mat('#1f5271',.79),green:k.mat('#337269',.82),cream:k.mat('#c6b991',.88),tile:k.mat('#214963',.58,.13),tileRidge:k.mat('#345a71',.56,.13)};
  p.tile.userData.preserveSmooth=true;p.tile.userData.prayerRoof=true;p.tileRidge.userData.preserveSmooth=true;
  for(const [m,intensity]of [[p.blue,.16],[p.green,.11],[p.gold,.16],[p.tile,.065],[p.tileRidge,.07]])m.userData.night={color:m.color.clone(),intensity};
  k.cyl(g,.145,.147,.012,p.cream,0,.108,0,96);
  // Twelve outer bays; the other sixteen structural columns belong to the interior.
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2,ca=a+Math.PI/12,x=Math.sin(ca)*.143,z=Math.cos(ca)*.143;
    k.cyl(g,.0043,.005,.122,p.red,x,.172,z,12);k.cyl(g,.006,.0065,.008,p.cream,x,.115,z,12);
    const q=new THREE.Group();q.rotation.y=a;g.add(q);const width=.067;
    for(let j=0;j<3;j++){
      const xx=(j-1)*.021;
      if(i===0&&j===1)continue;
      k.box(q,.019,.075,.004,p.dark,xx,.153,.134);
      for(const dx of [-.009,.009])k.box(q,.0018,.077,.004,p.red,xx+dx,.153,.137);
      for(let row=0;row<6;row++)for(let col=0;col<3;col++){
        const cx=xx+(col-1)*.0055,yy=.142+row*.007;stroke(k,q,[[cx-.002,yy,.138],[cx,yy+.003,.138],[cx+.002,yy,.138],[cx,yy-.003,.138]],.00055,p.gold);
      }
      k.box(q,.018,.020,.004,p.red,xx,.126,.139);
    }
    k.box(q,width,.018,.006,p.red,0,.208,.134);
    for(const xx of [-.024,0,.024]){
      k.box(q,.018,.011,.002,p.dark,xx,.208,.139);
      for(const sy of [-1,1])k.box(q,.020,.001,.003,p.gold,xx,.208+sy*.006,.141);
      for(const sx of [-1,1])k.box(q,.001,.013,.003,p.gold,xx+sx*.01,.208,.141);
      for(let col=0;col<4;col++)k.box(q,.0008,.011,.003,p.red,xx+(col-1.5)*.004,.208,.142);
    }
  }
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.cyl(g,.0035,.004,.246,p.red,Math.sin(a)*.09,.235,Math.cos(a)*.09,10);}
  for(const x of [-.034,.034])for(const z of [-.034,.034])k.cyl(g,.004,.0048,.334,p.red,x,.279,z,12);
  for(const [r,y,h,br]of [[.205,.255,.055,.158],[.169,.358,.049,.126],[.128,.455,.106,.089]]){
    band(k,g,br,y-.030,.031,p);brackets(k,g,br,y-.020,p);roof(k,g,r,y,h,p);
  }
  const finial=[[0,0],[.007,0],[.009,.004],[.008,.012],[.012,.021],[.014,.032],[.010,.042],[0,.045]].map(([r,y])=>new THREE.Vector2(r,y));k.mesh(g,new THREE.LatheGeometry(finial,32),p.gold,0,.564,0);k.ring(g,.009,.0017,p.tile,.562);
  verticalPlaque(k,g,p);g.userData.exteriorColumns=12;return g;
}
