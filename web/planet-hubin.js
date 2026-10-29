import {PLANET_RADIUS} from './planet-layout.js';
import {foliage} from './planet-nature.js';
import {createStreetProp} from './planet-street.js';

// A compressed, original interpretation of the Hubin shopping district.
// Apple Westlake's glass front and cantilever, and in77's varied street blocks,
// are the references. This is not a surveyed reconstruction of either building.
export function createHubinStreet(k){
  const {THREE,mesh,box,cyl,put,line}=k,g=new THREE.Group(),R=PLANET_RADIUS;
  const night=(o,name,emissive='#ffd8a3',intensity=.45)=>{o.name=name;o.material.userData.nightProfile={color:'#ffffff',emissive,intensity};return o;};
  const stone='#d8cfbd',ivory='#eee7d8',bronze='#94734e',ink='#466b68';
  const surfaceY=(x,z)=>Math.sqrt(R*R-x*x-z*z)-R;
  const ground=(o,x,z)=>{put(g,o,x,surfaceY(x,z),z);o.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(x,R+surfaceY(x,z),z).normalize()));return o;};
  function paving(x,z,w,d,color){
    const geo=new THREE.PlaneGeometry(w,d,12,10),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const px=p.getX(i)+x,pz=p.getY(i)+z;p.setXYZ(i,px,surfaceY(px,pz)+.001,pz);}geo.computeVertexNormals();
    const o=mesh(geo,color);o.material.side=THREE.DoubleSide;o.castShadow=false;g.add(o);
  }
  paving(0,0,.82,.70,'#d7d1c4');
  // Paving seams and the cross street follow the globe rather than a plinth.
  for(let i=-5;i<=5;i++)paving(i*.073,0,.0015,.69,'#c2bdae');
  for(let i=-4;i<=4;i++)paving(0,i*.078,.81,.0015,'#c2bdae');
  paving(0,0,.080,.69,'#e8e0d0');paving(0,-.055,.81,.055,'#e8e0d0');
  function glass(w,h){
    const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshPhysicalMaterial({color:'#bfd8d6',roughness:.12,metalness:.03,transparent:true,opacity:.15,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:.35}));
    o.name='hubin-clear-glass';o.castShadow=false;o.receiveShadow=false;return o;
  }
  function appleMark(){
    const s=new THREE.Shape();s.moveTo(.47,.79);s.bezierCurveTo(.31,.94,.06,.84,.07,.57);s.bezierCurveTo(.06,.32,.23,.02,.36,.05);s.bezierCurveTo(.46,.10,.50,.11,.61,.05);s.bezierCurveTo(.73,-.01,.88,.24,.94,.40);s.bezierCurveTo(.70,.48,.70,.68,.93,.77);s.bezierCurveTo(.84,.92,.66,.94,.52,.80);s.closePath();
    const mark=mesh(new THREE.ShapeGeometry(s,18),'#fff9e9');mark.material.emissive.set('#fff1cf');mark.material.emissiveIntensity=.30;mark.scale.set(.060,.060,1);mark.position.set(-.030,.176,.137);mark.name='apple-logo';
    const group=new THREE.Group();group.add(mark);
    const leaf=mesh(new THREE.CircleGeometry(1,20),'#fff9e9');leaf.scale.set(.007,.016,1);leaf.rotation.z=-.65;put(group,leaf,.005,.238,.137);return group;
  }
  function appleStore(){
    const a=new THREE.Group(),w=.35,d=.26,h=.27;
    a.name='apple-westlake';
    put(a,box(w,.011,d,ivory,.001),0,.003);
    night(put(a,box(w,.264,.012,'#c8c6ba',.001),0,.133,-d/2),'apple-lit-interior','#fff0d5',.18);
    for(const side of [-1,1])put(a,box(.013,h,d,stone,.001),side*w/2,h/2);
    put(a,box(w+.016,.014,d+.020,'#efece2',.002),0,h+.003);
    night(put(a,box(w-.017,.003,d-.015,'#fff6df',.001),0,h-.005),'apple-lit-ceiling','#fff0d5',.45);
    // The upper floor is pulled back, keeping a genuinely tall entrance hall.
    put(a,box(w-.025,.009,.145,ivory,.001),0,.146,-.050).name='apple-cantilever';
    put(a,glass(w-.031,.032),0,.166,.024);
    for(const y of [.02,.156])for(const x of [-.105,0,.105])for(const z of (y<.1?[-.06,.048]:[-.078])){
      put(a,box(.058,.006,.027,'#c59d69',.001),x,y+.020,z);
      for(const dx of [-.022,.022])put(a,box(.006,.020,.019,'#b58f5d',.001),x+dx,y+.008,z);
      for(const dx of [-.016,.016]){put(a,box(.012,.0015,.009,'#b7c3c0',.0005),x+dx,y+.024,z);const screen=put(a,box(.011,.008,.0015,'#5a7474',.0004),x+dx,y+.028,z-.003);screen.rotation.x=-.16;}
    }
    for(const side of [-1,1])for(let i=0;i<12;i++){
      put(a,box(.025,.004,.014,'#b2c6c0',.001),side*.148,.012+i*.012,.071-i*.015);
    }
    for(let i=0;i<=10;i++)put(a,box(.0017,h-.014,.009,'#a7b6af',.0003),-w/2+.013+i*(w-.026)/10,h/2,.129);
    put(a,glass(w-.026,h-.014),0,h/2,.133);
    for(const x of [-.022,.022]){put(a,box(.0018,.079,.003,bronze,.0003),x,.042,.136);put(a,box(.002,.015,.003,bronze,.0003),x*.65,.045,.139);}
    for(let i=0;i<8;i++)night(put(a,box(.003,.001,.22,'#d6d4c8',.0003),-.14+i*.040,h-.007),'apple-ceiling-strip','#fff0d5',1.8);
    night(put(a,box(w-.022,.002,.006,'#f7ecd9',.0003),0,.142,.024),'apple-mezzanine-strip','#fff0d5',1.1);
    a.add(appleMark());return a;
  }
  function sign77(){
    const group=new THREE.Group(),paths=[[[0,.003],[0,.028]],[[0,.038],[0,.040]],[[.012,.003],[.012,.028],[.027,.028],[.029,.003]],[[.041,.037],[.065,.037],[.047,.003]],[[.074,.037],[.098,.037],[.080,.003]]];
    for(const path of paths){const o=line(path.map(([x,y])=>new THREE.Vector3(x-.049,y-.020,0)),'#f4e4bc',.0023);night(o,'in77-letter','#ffe0ad',1.8);group.add(o);}return group;
  }
  function retailBlock({w,d,h,tone,style=0}){
    const b=new THREE.Group(),split=h*.52,trim='#455653';
    b.name=style===1?'in77-shopping-mall':'hubin-retail-colonnade';
    // Two broad retail levels, recessed behind a colonnade. There is no
    // repeated office-window grid or opaque tower body behind the shopfront.
    put(b,box(w,.008,d,ivory,.001),0,.004);
    put(b,box(w,h,.012,tone,.001),0,h/2,-d/2);
    put(b,box(w,.010,d,ivory,.001),0,split);
    put(b,box(w+.018,.012,d+.025,trim,.001),0,h);
    put(b,box(w+.008,.006,d+.012,ivory,.001),0,h+.009);
    // Interior walls are set back far enough to see real display depth.
    night(put(b,box(w-.022,h-.018,.010,'#d7b794',.001),0,h/2,-d*.12),'retail-lit-interior','#ffe1b5',.20);
    const storefront=(span,front,angle)=>{
      const f=new THREE.Group();f.rotation.y=angle;
      for(const x of [-span/2,-span/6,span/6,span/2]){
        put(f,box(.012,h,.018,tone,.001),x,h/2,front+.004);
        put(f,box(.016,.008,.024,ivory,.001),x,.009,front+.004);
      }
      put(f,box(span+.018,.019,.035,trim,.001),0,split+.005,front+.005);
      const bays=[-span/3,span/3],bay=span/3-.024;
      for(const [i,x] of bays.entries()){
        // Large ground-floor display windows with lit backs and plinths.
        night(put(f,box(bay,split-.027,.006,i===0?'#dcc8a7':'#a3b2a3',.001),x,split/2,front-.047),'retail-lit-display',i===0?'#ffce8a':'#e3ead9',.48);
        put(f,box(bay*.90,.008,.037,'#e8ddc9',.001),x,.014,front-.025);
        for(const dx of [-bay*.24,bay*.24]){
          const form=put(f,cyl(.007,.009,.024,style===2?(i===0?'#c69476':'#82988f'):(i===0?'#6f8e89':'#b58c72'),8),x+dx,.036,front-.025);form.name='retail-display';
          put(f,mesh(new THREE.SphereGeometry(.0048,8,6),'#e6c5a4'),x+dx,.054,front-.025);
          put(f,cyl(.001,.001,.015,bronze,6),x+dx,.020,front-.025);
        }
        put(f,glass(bay,split-.024),x,split/2+.002,front-.003);
        night(put(f,box(bay*.72,.009,.002,'#f1dca9',.0005),x,split-.016,front+.001),'retail-lit-shop-sign','#ffe0ad',1.3);
        night(put(f,box(bay,.002,.014,'#f5e4c6',.0003),x,h-.013,front-.018),'retail-upper-strip','#ffe1b5',1.2);
        // Upper level is a broad shop window, not a column of small panes.
        put(f,glass(bay,h-split-.027),x,(h+split)/2,front-.008);
        put(f,box(bay*.72,.009,.027,'#b2936f',.001),x,split+.025,front-.028);
        for(const dx of [-bay*.28,bay*.28])put(f,box(.002,h-split-.018,.003,bronze,.0005),x+dx,(h+split)/2,front-.003);
      }
      // A dark, tall, recessed entrance distinguishes the central bay.
      const entry=span/3-.026;
      night(put(f,box(entry,split-.018,.004,'#54716b',.001),0,split/2,front-.037),'retail-lit-entrance','#ffd395',.24);
      night(put(f,box(span-.016,.002,.008,'#f5e4c6',.0003),0,split-.007,front+.025),'retail-colonnade-strip','#ffd395',1.1);
      for(const x of [-entry*.45,entry*.45])put(f,box(.003,split-.018,.018,bronze,.0005),x,split/2,front-.009);
      put(f,glass(entry*.83,split-.018),0,split/2,front-.004);
      for(const x of [-.008,.008])put(f,box(.0015,.017,.003,'#d5bc89',.0005),x,.041,front+.002);
      if(style===1&&angle===0){
        put(f,box(span*.54,h-split-.012,.018,'#3c504d',.001),0,(h+split)/2,front+.010);
        const sign=sign77();sign.scale.setScalar(1.28);put(f,sign,0,(h+split)/2,front+.025);
        put(f,box(span*.69,.006,.055,'#657976',.001),0,split-.005,front+.015);
      }else{
        put(f,glass(entry,h-split-.027),0,(h+split)/2,front-.008);
        for(const x of bays){
          const awning=put(f,box(bay+.012,.005,.042,style===2?'#9b6b51':'#6b8176',.001),x,split-.009,front+.013);awning.rotation.x=.12;
          // Three inset fabric stripes follow the existing sloped awning.
          for(const offset of [-.30,0,.30]){
            const stripe=mesh(new THREE.PlaneGeometry((bay+.012)*.13,.040),'#efe3ca');
            stripe.name='retail-awning-stripe';stripe.rotation.x=-Math.PI/2;
            put(awning,stripe,offset*(bay+.012),.003,0);
          }
        }
      }
      b.add(f);
    };
    storefront(w,d/2,0);
    storefront(d,w/2,Math.PI/2);
    storefront(d,w/2,-Math.PI/2);
    // Original shallow display niches on the exterior of the rear wall (-z).
    // Each layer steps towards -z; the existing +z entrance stays open.
    put(b,box(w-.04,.004,.004,trim,.001),0,split,-d/2-.008);
    for(const [i,x] of [-w*.25,w*.25].entries()){
      const zw=-d/2-.008,ww=w*.34,wh=split*.65;
      put(b,box(ww+.008,wh+.008,.004,'#3c504d',.001),x,split*.50,zw);
      night(put(b,box(ww,wh,.003,i===0?'#c6b494':'#8eaaa2',.001),x,split*.50,zw-.001),'retail-rear-display','#ffdb9d',.32);
      put(b,box(ww*.78,.008,.002,'#e8ddc9',.001),x,split*.50-wh*.32,zw-.003);
      put(b,box(ww*.70,.003,.002,'#f1dca9',.0005),x,split*.50+wh*.36,zw-.003);
      put(b,box(ww*.18,wh*.24,.002,'#eee3cf',.0005),x-ww*.20,split*.50-wh*.20+.004,zw-.003);
      const vase=cyl(ww*.045,ww*.07,wh*.38,'#ad805f',8);
      vase.scale.z=.12;put(b,vase,x+ww*.18,split*.50-wh*.13+.004,zw-.003);
    }
    // Flat roof becomes an occupied terrace, with open rails and planters.
    put(b,box(w-.025,.004,d-.027,'#c7b79c',.001),0,h+.014);
    for(const side of [-1,1]){
      put(b,box(w,.002,.003,bronze,.0005),0,h+.034,side*d/2);
      for(const x of [-w*.45,0,w*.45])put(b,box(.002,.023,.003,bronze,.0005),x,h+.023,side*d/2);
    }
    for(const x of [-w*.34,w*.34]){put(b,box(.034,.014,.040,'#aa9474',.001),x,h+.021,-d*.20);put(b,foliage(.018,.010,.021,'#788d60',x*11,10),x,h+.032,-d*.20);}
    for(const x of [-w*.18,w*.18]){put(b,cyl(.014,.014,.003,'#e9d8b6',16),x,h+.032,.025);put(b,cyl(.002,.002,.018,bronze,6),x,h+.023,.025);}
    // One shaded table and one open table keep each terrace readable.
    const parasol=new THREE.Group();parasol.name='retail-terrace-parasol';
    put(parasol,cyl(.0013,.0016,.072,bronze,8),0,.052,0).name='retail-parasol-pole';
    const canopy=put(parasol,mesh(new THREE.ConeGeometry(.045,.012,12,1,true),'#e4d6b6'),0,.084,0);
    canopy.name='retail-parasol-canopy';canopy.material.side=THREE.DoubleSide;
    put(b,parasol,style===1?w*.18:-w*.18,h,.025);
    // Two low seats face each existing table. Local +z is the chair front.
    for(const x of [-w*.18,w*.18])for(const side of [-1,1]){
      const seat=new THREE.Group();seat.position.set(x,h,.025+side*.028);seat.rotation.y=side<0?0:Math.PI;
      put(seat,box(.017,.003,.016,'#b2936f',.001),0,.024,0);
      put(seat,box(.017,.016,.002,'#b2936f',.001),0,.0305,-.007);
      put(seat,box(.002,.0065,.014,bronze,.001),-.006,.01925,0);
      put(seat,box(.002,.0065,.014,bronze,.001),.006,.01925,0);
      b.add(seat);
    }
    return b;
  }
  ground(appleStore(),-.215,.105);
  ground(retailBlock({w:.32,d:.25,h:.195,tone:'#eee6d6',style:1}),.225,.105);
  ground(retailBlock({w:.33,d:.205,h:.175,tone:'#eee5d2',style:2}),-.22,-.235);
  ground(retailBlock({w:.32,d:.205,h:.185,tone:'#dfd3bc',style:0}),.22,-.235);
  // People cluster around shop entrances, tables and the lane, with a clear
  // through-route. Every position is explicit, never scattered on the globe.
  const people=[[-.33,.29],[-.29,.31],[-.19,.32],[-.16,.28],[-.10,.31],[.10,.30],[.14,.32],[.24,.30],[.31,.28],[.33,.32],[-.014,.15],[.014,.09],[-.014,-.02],[.015,-.13],[-.018,-.26],[-.18,-.052],[-.27,-.060],[.16,-.052],[.28,-.055]];
  for(const [i,[x,z]] of people.entries()){const visitor=createStreetProp({id:'hubin-visitor-'+i,type:'visitor',color:['#b58470','#607c82','#d8c7a6','#8e9b79'][i%4]});visitor.scale.setScalar(.82);ground(visitor,x,z);}
  for(const [x,z] of [[-.365,.27],[.365,.27],[-.043,.12],[.043,-.19]]){const lamp=createStreetProp({id:'hubin-lamp',type:'lamp'});lamp.scale.setScalar(.75);lamp.traverse(o=>{if(o.isMesh&&o.material.color.getHexString()==='f2dfac')night(o,'hubin-lit-lamp','#ffdd9c',1.6);});ground(lamp,x,z);}
  for(const x of [-.32,.31]){
    const bench=createStreetProp({id:'hubin-seat',type:'bench'});bench.scale.setScalar(.65);ground(bench,x,.345);
  }
  g.traverse(o=>{if(!o.isMesh||o.material.vertexColors||o.material.transparent)return;const c=o.material.color,values=new Float32Array(o.geometry.attributes.position.count*3);for(let i=0;i<values.length;i+=3){values[i]=c.r;values[i+1]=c.g;values[i+2]=c.b;}o.geometry.setAttribute('color',new THREE.Float32BufferAttribute(values,3));o.material.color.set('#ffffff');o.material.vertexColors=true;});
  return g;
}
