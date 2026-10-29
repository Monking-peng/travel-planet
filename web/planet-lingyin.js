import * as THREE from 'three';
import {woodlandTree} from './planet-nature.js';
import {createStreetProp} from './planet-street.js';
import {createIncenseSmoke} from './planet-incense.js';
import {LINGYIN_GLYPHS} from './planet-lingyin-glyphs.js';

// An artistic miniature of the wooded Lingyin axis, not a survey model.
export function createLingyinTemple(w=.50,d=.54,radius=1.42){
  const root=new THREE.Group();root.name='lingyin-temple';
  const materials=new Map(),v=(x,y,z)=>new THREE.Vector3(x,y,z);
  const palette={wall:'#c4a055',wood:'#864a3b',roof:'#555d59',ridge:'#72796b',stone:'#bdb9a4',paving:'#d6cbb1',dark:'#4f5043',bronze:'#788575'};
  const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.87}));return materials.get(color);};
  function add(geo,color,name,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat(color));o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;}
  const box=(name,x,y,z,a,b,c,color)=>add(new THREE.BoxGeometry(a,b,c),color,name,x,y,z);
  const ground=(x,z)=>Math.sqrt((radius+.006)**2-x*x-z*z)-(radius+.014);
  function line(name,points,r,color){const curve=new THREE.CatmullRomCurve3(points.map(p=>v(...p)));return add(new THREE.TubeGeometry(curve,Math.max(4,(points.length-1)*2),r,4,false),color,name);}
  // Closed terrace skirts terminate on the spherical ground, never in the air.
  function terrace(name,x0,x1,z0,z1,y){
    const p=[],ix=[],corners=[[x0,z0],[x0,z1],[x1,z1],[x1,z0]];
    for(const [x,z] of corners)p.push(x,y,z);
    for(const [x,z] of corners)p.push(x,ground(x,z)-.002,z);
    ix.push(0,1,2,0,2,3,4,6,5,4,7,6);
    for(let i=0;i<4;i++){const j=(i+1)%4;ix.push(i,i+4,j,j,i+4,j+4);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
    return add(g,palette.paving,name);
  }
  terrace('lingyin-lower-court',-.245,.245,.045,.205,.024);
  terrace('lingyin-main-terrace',-.245,.245,-.11,.045,.065);
  terrace('lingyin-upper-court',-.245,.245,-.26,-.11,.115);
  function steps(name,x,z,width,from,to,length,count){
    for(let i=0;i<count;i++){const top=from+(to-from)*(i+1)/count,depth=length/count;
      box(name+'-'+i,x,(from+top)/2,z-i*depth,width,top-from,depth+.0002,palette.stone);}
  }
  steps('lingyin-main-stair',0,.075,.096,.024,.065,.03,6);
  steps('lingyin-rear-stair',0,-.083,.082,.065,.115,.027,7);
  // Entry steps descend to a curved forepath whose outer end meets the road.
  const entryY=ground(0,.245)+.003;
  steps('lingyin-entry-stair',0,.245,.108,entryY,.024,.04,7);
  const ap=[],ai=[];
  for(let i=0;i<=8;i++){const z=.242+i*.028/8,y=ground(0,z)+.003;ap.push(-.054,y,z,.054,y,z);if(i){const k=i*2;ai.push(k-2,k,k-1,k-1,k,k+1);}}
  const approach=new THREE.BufferGeometry();approach.setAttribute('position',new THREE.Float32BufferAttribute(ap,3));approach.setIndex(ai);approach.computeVertexNormals();add(approach,palette.stone,'lingyin-entry-path');

  function roof(name,x,z,y,width,depth,rise){
    // A closed, curved hip roof, lifted at all four corners. Separate tiers
    // leave real clerestory walls visible below the Mahavira roof.
    const segments=48,rings=7,positions=[],indices=[];
    const sample=(i,j,bottom=false)=>{
      const angle=i/segments*Math.PI*2,t=j/rings,c=Math.cos(angle),s=Math.sin(angle),den=Math.max(Math.abs(c),Math.abs(s));
      const px=c/den*(width*.27+width*.23*t),pz=s/den*(.001+(depth*.5-.001)*t);
      const corner=Math.pow(Math.min(Math.abs(c),Math.abs(s))/Math.max(Math.abs(c),Math.abs(s)),4);
      return [x+px,y+rise*Math.pow(1-t,1.7)+Math.min(.009,Math.min(width,depth)*.05)*Math.pow(t,7)*corner-(bottom?.003:0),z+pz];
    };
    for(let side=0;side<2;side++)for(let j=0;j<=rings;j++)for(let i=0;i<segments;i++)positions.push(...sample(i,j,side===1));
    const offset=(rings+1)*segments;
    for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
      const a=j*segments+i,b=j*segments+(i+1)%segments,c=a+segments,e=b+segments;
      indices.push(a,b,c,b,e,c,offset+a,offset+c,offset+b,offset+b,offset+c,offset+e);
    }
    for(const ring of [0,rings])for(let i=0;i<segments;i++){
      const a=ring*segments+i,b=ring*segments+(i+1)%segments;
      if(ring===rings)indices.push(a,a+offset,b,b,a+offset,b+offset);
      else indices.push(a,b,a+offset,b,b+offset,a+offset);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();add(g,palette.roof,name);
    for(const side of [-1,1]){
      const px=x+side*width*.28;
      line(name+'-ridge-tail',[[px-side*.008,y+rise+.004,z],[px,y+rise+.011,z],[px-side*.003,y+rise+.019,z]],.0018,palette.ridge);
    }
    line(name+'-ridge',[[x-width*.285,y+rise+.007,z],[x-width*.21,y+rise+.003,z],[x+width*.21,y+rise+.003,z],[x+width*.285,y+rise+.007,z]],.0023,palette.ridge);
    for(let i=0;i<segments;i+=2){const pts=Array.from({length:rings+1},(_,j)=>sample(i,j).map((n,k)=>n+(k===1?.0008:0)));line(name+'-tile-'+i,pts,.0007,palette.ridge);}
  }
  function hall(name,x,z,floor,width,depth,height,tiers=1){
    box(name+'-plinth',x,floor+.004,z,width+.014,.008,depth+.014,palette.stone);
    box(name+'-walls',x,floor+.008+height/2,z,width,height,depth,palette.wall);
    const face=z+depth/2+.001;
    for(let i=0;i<7;i++){
      const px=x+width*(i-3)/7;
      box(name+'-door-'+i,px,floor+.008+height*.40,face,width*.085,height*.80,.003,palette.dark);
      for(const q of [-1,0,1])box(name+'-lattice-'+i+'-'+q,px+q*width*.022,floor+.008+height*.40,face+.002,.0012,height*.78,.0015,palette.wood);
      box(name+'-lintel-'+i,px,floor+.008+height*.64,face+.002,width*.085,.0015,.0015,palette.wood);
    }
    for(let i=0;i<8;i++){
      const px=x+width*(i-3.5)/7;
      add(new THREE.CylinderGeometry(.0027,.0032,height+.003,8),palette.wood,name+'-pillar-'+i,px,floor+.009+height/2,face+.009);
      box(name+'-bracket-'+i,px,floor+height+.006,face+.010,.010,.005,.013,palette.wood);
      box(name+'-dougong-upper-'+i,px,floor+height+.010,face+.011,.015,.003,.016,palette.wood);
      box(name+'-dougong-lower-'+i,px,floor+height+.002,face+.008,.006,.004,.009,palette.wood);
      add(new THREE.CylinderGeometry(.005,.005,.003,8),palette.stone,name+'-column-foot',px,floor+.010,face+.009);
    }
    // Recessed side windows, crossed mullions and a continuous red cornice
    // keep the walls legible from the oblique mountain view.
    for(const side of [-1,1])for(let k=0;k<3;k++){
      const px=x+side*(width/2+.001),pz=z+(k-1)*depth*.25;
      box(name+'-side-window',px,floor+.008+height*.52,pz,.002,height*.40,depth*.16,palette.dark);
      for(const q of [-1,0,1])box(name+'-side-mullion',px+side*.0015,floor+.008+height*.52,pz+q*depth*.045,.001,height*.40,.0015,palette.wood);
      box(name+'-side-crossbar',px+side*.0015,floor+.008+height*.50,pz,.001,.0015,depth*.16,palette.wood);
    }
    box(name+'-front-cornice',x,floor+height-.002,face+.003,width,.005,.006,palette.wood);
    if(tiers===3){
      for(let i=0;i<3;i++){
        const ry=floor+height+.010+i*.030,tw=width+.08-i*.029,td=depth+.075-i*.022;
        if(i)box(name+'-clerestory-'+i,x,ry-.007,z,tw-.042,.024,td-.040,palette.wall);
        roof(name+'-roof-'+i,x,z,ry,tw,td,i===2?.038:.023);
      }
    }else roof(name+'-roof',x,z,floor+height+.011,width+.045,depth+.035,.030);
  }
  hall('lingyin-tianwang',0,.158,.024,.216,.069,.049);
  hall('lingyin-mahavira',0,-.043,.065,.210,.128,.060,3);
  hall('lingyin-rear-hall',0,-.204,.115,.231,.066,.044);
  // Low cloisters enclose the sequence while leaving the main hall dominant.
  for(const side of [-1,1])for(const [z,y,len] of [[.105,.024,.15],[-.033,.065,.125],[-.187,.115,.143]]){
    const x=side*.217;
    box('lingyin-cloister-wall',x,y+.020,z,.008,.040,len,palette.wall);
    for(let i=0;i<5;i++)box('lingyin-cloister-post',x-side*.025,y+.020,z+(i-2)*len/5,.003,.040,.003,palette.wood);
    const first=root.children.length;
    roof('lingyin-cloister-roof',0,0,y+.042,len+.008,.065,.017);
    for(const mesh of root.children.slice(first)){mesh.rotateY(Math.PI/2);mesh.position.set(x-side*.008,0,z);}
  }
  // A central stone axis and low terrace balustrades make the court legible
  // between the halls without filling it with unrelated decoration.
  for(const [z,y] of [[.086,.024],[.115,.024],[-.127,.115],[-.153,.115]])box('lingyin-axis-slab',0,y+.0008,z,.055,.0016,.023,palette.stone);
  for(const side of [-1,1]){
    for(let i=0;i<5;i++)box('lingyin-balustrade-post',side*(.064+i*.029),.076,.036,.004,.022,.004,palette.stone);
    box('lingyin-balustrade-rail',side*.122,.085,.036,.125,.003,.003,palette.stone);
  }
  for(const side of [-1,1]){
    // The paired stone pagodas sit in front of the main hall terrace.
    const x=side*.084,z=.060,base=.024;
    add(new THREE.CylinderGeometry(.014,.016,.006,8),palette.stone,'lingyin-stone-pagoda-base',x,base+.003,z);
    for(let level=0;level<9;level++){
      const r=.0105-level*.0008,y=base+.010+level*.0065;
      add(new THREE.CylinderGeometry(r*.72,r*.75,.005,8),palette.stone,'lingyin-stone-pagoda-body',x,y,z);
      add(new THREE.ConeGeometry(r,.003,8),palette.ridge,'lingyin-stone-pagoda-eave',x,y+.0036,z);
    }
    add(new THREE.ConeGeometry(.003,.008,8),palette.stone,'lingyin-stone-pagoda-finial',x,base+.074,z);
    const tree=woodlandTree(.026,.067,'lingyin-old-tree-'+side);tree.position.set(side*.158,.024,.110);root.add(tree);
    const lamp=box('lingyin-lantern',side*.070,.071,.204,.009,.012,.009,'#e0b76b');lamp.material=lamp.material.clone();lamp.material.emissive.set('#df9d45');lamp.material.emissiveIntensity=.30;
    box('lingyin-lantern-post',side*.070,.046,.204,.0025,.048,.0025,palette.wood);
  }
  // Bronze incense vessel and a small number of visitors keep the court calm.
  add(new THREE.CylinderGeometry(.013,.009,.011,8),palette.bronze,'lingyin-incense-vessel',0,.031,.100);
  for(const x of [-.009,.009]){
    box('lingyin-vessel-leg',x,.026,.100,.003,.008,.003,palette.bronze);
    line('lingyin-vessel-handle',[[x,.034,.100],[x*1.65,.039,.100],[x*1.65,.044,.100],[x,.042,.100]],.0014,palette.bronze);
  }
  add(new THREE.TorusGeometry(.012,.0014,4,16),palette.bronze,'lingyin-vessel-rim',0,.038,.100).rotation.x=Math.PI/2;
  for(const [i,x,z,pose] of [[0,-.078,.200,'walk'],[1,.080,.198,'walk'],[2,-.050,.098,'stand'],[3,.040,.078,'stand'],[4,.165,-.105,'stand'],[5,-.166,-.13,'walk']]){
    const person=createStreetProp({id:'lingyin-visitor-'+i,type:'visitor',color:['#b68767','#6d8790','#b49a63'][i%3],pose});
    person.name='lingyin-visitor-'+i;person.scale.setScalar(.72);person.position.set(x,z<-.11?.115:z<.045?.065:.024,z);root.add(person);
  }
  // Static vector lettering remains sharp and exports without a font runtime.
  box('lingyin-plaque',0,.079,.195,.060,.021,.003,'#444d42');
  for(let i=0;i<LINGYIN_GLYPHS.length;i++){
    const path=new THREE.ShapePath();for(const contour of LINGYIN_GLYPHS[i]){path.moveTo(...contour[0]);for(const p of contour.slice(1))path.lineTo(...p);path.currentPath.closePath();}
    const glyph=add(new THREE.ShapeGeometry(path.toShapes(false),3),'#e2c580','lingyin-character-'+i,-.018+i*.018,.072,.197);glyph.scale.setScalar(.016);glyph.userData.character='灵隐寺'[i];
  }
  const smoke=createIncenseSmoke();smoke.position.set(0,.038,.100);root.add(smoke);
  root.scale.set(w/.50,1,d/.54);return root;
}
