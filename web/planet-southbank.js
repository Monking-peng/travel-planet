import * as THREE from 'three';
import {WELCOME_GLYPHS} from './planet-welcome-glyphs.js';

// Individual riverfront landmarks, artistically compressed onto the globe.
// Stadium silhouette reference: NBBJ's Hangzhou Olympic Sports Center.
const tau=Math.PI*2;
const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness,side:THREE.DoubleSide});
function kit(name){
  const g=new THREE.Group();g.name=name;
  const add=(geometry,material,label,x=0,y=0,z=0)=>{
    const m=new THREE.Mesh(geometry,material);m.name=label;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;
  };
  const box=(x,y,z,w,h,d,m,label)=>add(new THREE.BoxGeometry(w,h,d),m,label,x,y,z);
  const surface=(rows,cols,sample,m,label)=>{
    const p=[],ix=[];
    for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++)p.push(...sample(i/rows,j/cols));
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;ix.push(a,a+1,b,a+1,b+1,b);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();
    const normals=geo.attributes.normal;for(let n=0;n<normals.count;n++)if(Math.hypot(normals.getX(n),normals.getY(n),normals.getZ(n))<.5)normals.setXYZ(n,0,1,0);
    return add(geo,m,label);
  };
  const line=(pts,material,label,r=.0009)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),Math.max(pts.length-1,2),r,3,false),material,label);
  return {g,add,box,surface,line};
}

// Profiles survive material cloning and batching. Day geometry stays neutral;
// the runtime night controller lights only the designed facade elements.
function nightMaterial(day,color,power=.8,roughness=.6,animation="facade"){
  const m=mat(day,roughness,.12);m.userData.nightProfile={color,emissive:color,intensity:power,animation};return m;
}
function ovalApron(k,rx,rz,radius){
  const stone=mat('#b6bdb7');
  k.surface(3,48,(t,u)=>{
    const a=u*tau,x=rx*Math.cos(a)*t,z=rz*Math.sin(a)*t;
    const y=Math.sqrt((radius+.009)**2-x*x-z*z)-(radius+.014);
    return [x,y,z];
  },stone,'landmark-oval-apron');
}

// SOM's curved twin towers retain their suspended link, with no shared city
// block underneath. The other riverfront buildings are independent parcels.
export function createSouthbankSkyline(w=.22,d=.10,radius=1.42){
  const k=kit('hangzhou-gate'),{g,box,surface}=k;
  const glass=mat('#577b8c',.38,.24),dark=mat('#304a60',.52),silver=mat('#aebec7',.5,.2);
  const cool=nightMaterial('#9bb8c2','#68baff',.95),violet=nightMaterial('#8ba6ba','#b479ef',.85);
  const crown=nightMaterial('#cfbc8e','#ffd497',1.15);
  const h=.54,x0=w*.305,tw=w*.28,td=d*.72;
  for(const sign of [-1,1]){
    const x=sign*x0;
    // A small plinth follows each tower's own ellipse, not a rectangular lot.
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.028,20),silver);
    base.scale.set(tw*.57,1,td*.57);base.position.set(x,-.001,0);base.name='gate-individual-foot';g.add(base);
    const section=(t,a,offset=0)=>{
      const taper=1-.18*t+.09*Math.sin(Math.PI*t);
      return [x+sign*.004*Math.sin(Math.PI*t)+(tw/2*taper+offset)*Math.cos(a),.006+h*t,(td/2*taper+offset)*Math.sin(a)];
    };
    surface(9,20,(t,u)=>section(t,u*tau),glass,'hangzhou-gate-tower');
    surface(1,20,(t,u)=>{const p=section(1,u*tau);return [x+(p[0]-x)*t,.006+h,p[2]*t];},dark,'gate-roof');
    // Alternating blue/lilac ribbons follow the glass curvature; restrained
    // horizontal joints and amber crowns keep the skyline legible at night.
    for(let j=0;j<20;j++)surface(9,1,(t,u)=>section(t,j*tau/20+(u-.5)*.055,.0003),j%4===0?violet:cool,'gate-led-fin');
    for(let j=1;j<22;j++)surface(1,20,(t,u)=>section(j/22+(t-.5)*.0012,u*tau,.00028),silver,'gate-floor-joint');
    for(const t of [.966,.989])surface(1,20,(v,u)=>section(t+(v-.5)*.004,u*tau,.00045),crown,'gate-crown-light');
    box(x,.018,td/2+.004,tw*.65,.032,.009,dark,'gate-lobby');
    box(x,.034,td/2+.007,tw*.68,.002,.012,crown,'gate-lobby-light');
  }
  const half=x0-tw*.34,depth=td*.70;
  const upper=x=>.179+.354*Math.pow(Math.abs(x/half),2.8);
  const lower=x=>.026+.111*Math.sqrt(Math.max(0,1-(x/half)**2));
  for(const side of [-1,1]){
    surface(24,1,(t,u)=>{const x=(t*2-1)*half;return [x,lower(x)+(upper(x)-lower(x))*u,side*depth/2];},glass,'gate-suspended-veil');
    for(const edge of [upper,lower])surface(24,1,(t,u)=>{const x=(t*2-1)*half;return [x,edge(x)+(u-.5)*.002,side*(depth/2+.0004)];},cool,'gate-veil-edge');
    for(let j=1;j<22;j++)surface(1,1,(t,u)=>{const x=(-1+2*j/22+(u-.5)*.024)*half;return [x,lower(x)+(upper(x)-lower(x))*t,side*(depth/2+.0005)];},j%3?violet:cool,'gate-veil-led');
  }
  for(const edge of [upper,lower])surface(24,1,(t,u)=>{const x=(t*2-1)*half;return [x,edge(x),(u-.5)*depth];},dark,'gate-link-soffit');
  return g;
}

export function createRiverTower({size:[w=.068,d=.060]=[],height:h=.36,style=0,welcome=false,entrance}={}){
  const {g,add,box,surface}=kit('individual-river-tower');
  const glass=mat(['#608390','#516e89','#718c9b'][style%3],.39,.20),dark=mat('#33495b',.50),silver=mat('#a9b9c0',.55,.16);
  const blue=nightMaterial('#819caa',['#78bdff','#8c9fff','#76ceda'][style%3],.70);
  const amber=nightMaterial('#c4b99a','#ffce83',.80),lilac=nightMaterial('#9aafbc','#bc8ef5',.75);
  const tw=w*.84,td=d*.75,base=.003;
  // Chamfered corners, alternating sloped/setback crowns and shallow lobbies
  // replace identical cuboids; no land plate surrounds the tower.
  const outline=[[-.5,-.34],[-.34,-.5],[.34,-.5],[.5,-.34],[.5,.34],[.34,.5],[-.34,.5],[-.5,.34]];
  const section=(t,u,pad=0)=>{
    const i=((Math.floor(u*8)%8)+8)%8,f=u*8-Math.floor(u*8),a=outline[i],b=outline[(i+1)%8];
    const taper=1-(style%3===0?.17:.07)*t;
    const x=(a[0]+(b[0]-a[0])*f)*(tw*taper+pad),z=(a[1]+(b[1]-a[1])*f)*(td*taper+pad);
    const top=h+(style%3===1?x/tw*.037:0);
    return [x,base+t*top,z];
  };
  surface(8,24,(t,u)=>section(t,u),glass,'river-tower-glass');
  surface(1,24,(t,u)=>{const p=section(1,u);return [p[0]*t,base+h+(p[1]-base-h)*t+.0002,p[2]*t];},dark,'river-tower-roof');
  for(let j=0;j<8;j++)surface(8,1,(t,u)=>section(t,(j+(u-.5)*.032)/8+.00001,.0006),style%2?amber:blue,'tower-corner-led');
  for(let j=1;j<Math.floor(h/.018);j++)surface(1,24,(t,u)=>section(j*.018/h+(t-.5)*.0014,u,.0005),silver,'tower-floor-joint');
  for(const t of [.96,.99])surface(1,24,(v,u)=>section(t+(v-.5)*.004,u,.0009),style%3===2?lilac:amber,'tower-lit-crown');
  const panel=(x,y,z,width,height,m,name)=>add(new THREE.PlaneGeometry(width,height),m,name,x,y,z);
  // Vertical programmable ribbons form a quiet blue-to-lilac facade picture.
  // Front and rear have separate short segments, never an opaque neon slab.
  for(const side of [-1,1])for(let col=0;col<7;col++)for(let row=0;row<9;row++){
    if(welcome&&side===1&&col>1&&col<5)continue;
    const t=.13+row*.086,x=(col-3)*.105;
    if((col+row+style)%5===0)continue;
    // Sample the same tapered/sloped elevation as the glass. Flat billboards
    // used to sink into the lower edge and float above the upper edge.
    surface(2,1,(v,u)=>{
      const across=x+(u-.5)*.043,edge=side===1?5+(.34-across)/.68:1+(across+.34)/.68;
      const p=section(t+(v-.5)*.055,edge/8);p[2]+=side*.0008;return p;
    },row>5?lilac:blue,'facade-led-ribbon');
  }
  for(const side of [-1,1])for(let row=0;row<12;row++){
    const t=.10+row*.068,z=((row+style)%3-1)*.21;
    surface(1,1,(v,u)=>{
      const across=z+(u-.5)*.12,edge=side===1?3+(across+.34)/.68:7+(.34-across)/.68;
      const p=section(t+(v-.5)*.006/h,edge/8);p[0]+=side*.0008;return p;
    },amber,'office-lit-room');
  }
  box(0,.006,0,tw*.94,.040,td*.94,dark,'tower-lobby');
  // The street door faces the adjacent river walk; the show facade still
  // faces City Balcony. This avoids diagonal access paths between neighbours.
  const entry=entrance||[0,td*.46+.0062],side=Math.abs(entry[0])>tw*.4;
  const turn=side?Math.sign(entry[0])*Math.PI/2:entry[1]<0?Math.PI:0;
  const span=side?td:tw;
  const canopy=box(entry[0],.028,entry[1],span*.70,.003,.012,silver,'tower-entry-canopy');canopy.rotation.y=turn;
  const lamp=panel(entry[0]+Math.sin(turn)*.0062,.026,entry[1]+Math.cos(turn)*.0062,span*.59,.002,amber,'tower-entry-light');lamp.rotation.y=turn;
  if(welcome){
    // The sign is attached to the river-facing elevation and stays outside
    // the tapered glass skin. Real glyph outlines avoid missing canvas fonts.
    const z=td/2+.0016,cy=h*.52,screenH=h*.70;
    const screen=box(0,cy,z,tw*.54,screenH,.0015,dark,'hangzhou-welcome-screen');screen.userData.text='杭州欢迎您';
    const ink=nightMaterial('#dfcfaa','#ffdb92',1.05,.6,null),scale=tw*.43,spacing=screenH/5.7;
    for(let c=0;c<WELCOME_GLYPHS.length;c++){
      const path=new THREE.ShapePath();
      for(const contour of WELCOME_GLYPHS[c]){path.moveTo(...contour[0]);for(const p of contour.slice(1))path.lineTo(...p);path.currentPath.closePath();}
      const glyph=add(new THREE.ShapeGeometry(path.toShapes(false),3),ink,'welcome-character-'+c,0,cy+spacing*(2-c),z+.0011);
      glyph.scale.setScalar(scale);glyph.userData.character='杭州欢迎您'[c];
    }
  }
  return g;
}
export function createOlympicLotus(w=.40,d=.28,radius=1.42){
  const k=kit('hangzhou-olympic-lotus'),{g,add,box,surface,line}=k;
  ovalApron(k,w*.49,d*.49,radius);
  const white=nightMaterial('#e1e6e3','#9b61cf',.16,.46,'lotus'),pearl=nightMaterial('#b8c8cb','#cf99e8',.22,.48,'lotus'),rib=nightMaterial('#a5b4ba','#ead9ff',1.25,.6,'lotus');
  const bowl=mat('#7c989e'),seat=mat('#b4c8cb'),floor=mat('#c8cdca'),aisle=mat('#d5dcd5');
  const light=nightMaterial('#c9b8d0','#d38bff',.9,.6,'lotus');
  const rx=w*.43,rz=d*.39;
  surface(1,64,(t,u)=>{const a=u*tau,x=rx*.79*Math.cos(a),z=rz*.79*Math.sin(a),ground=Math.sqrt((radius+.007)**2-x*x-z*z)-(radius+.014);return [x,ground+(.012-ground)*t,z];},mat('#869599'),'stadium-grounded-base');
  const oval=(scale,y,material,name)=>{
    // One centre vertex replaces 65 coincident centres and zero-area faces.
    // Keep the same 64-segment outline; this pays for the terraced forecourt.
    const p=[0,y,0],ix=[];
    for(let i=0;i<64;i++){const a=i*tau/64;p.push(Math.cos(a)*rx*scale,y,Math.sin(a)*rz*scale);}
    for(let i=0;i<64;i++)ix.push(0,(i+1)%64+1,i+1);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();
    return add(geo,material,name);
  };
  const ovalStroke=(scale,y,width,material,name)=>surface(64,1,(t,u)=>{
    const a=t*tau,r=scale+(u-.5)*width;return [Math.cos(a)*rx*r,y,Math.sin(a)*rz*r];},material,name);
  // A quiet neutral event floor keeps attention on the lotus shell.
  // No football pitch, sports markings or terracotta running track.
  surface(64,2,(t,u)=>{const a=t*tau,r=.46+u*.38;return [rx*r*Math.cos(a),.011+u*.045,rz*r*Math.sin(a)];},bowl,'stadium-seating-bowl');
  for(let k=0;k<8;k++){
    const r=.49+k*.043;
    ovalStroke(r,.012+(r-.46)/.38*.045,.010,seat,'seating-row');
  }
  oval(.465,.0112,floor,'stadium-event-floor');
  for(let i=0;i<16;i++)surface(1,1,(t,u)=>{
    const a=i*tau/16+(u-.5)*.025,r=.47+t*.36;
    return [rx*r*Math.cos(a),.0128+(r-.46)/.38*.045,rz*r*Math.sin(a)];
  },aisle,'stadium-seating-aisle');
  ovalStroke(.833,.057,.012,pearl,'stadium-upper-rim');
  ovalStroke(.84,.019,.018,light,'stadium-petal-uplight');
  // Swept, pointed shells grow from the low plinth, bulge out, then lean
  // over the stands. Alternating large/small shells reproduce the lotus
  // silhouette rather than putting spikes around a circular building.
  function petal(index,count,small){
    const angle=index*tau/count+(small?tau/56:0),height=small?.068:.092,rows=small?12:16,cols=6;
    const sample=(t,u)=>{
      const spread=Math.pow(Math.sin(Math.PI*t),.72)*(small?.080:.112)+.022*(1-t);
      const a=angle+(u*2-1)*spread+.066*Math.sin(Math.PI*t);
      const r=(.79+.25*Math.sin(Math.PI*t)-.12*t)*(small?.92:1);
      const y=.007+height*Math.sin(t*Math.PI*.62)+Math.sin(u*Math.PI)*.009*Math.sin(Math.PI*t);
      return [rx*r*Math.cos(a),y,rz*r*Math.sin(a)];
    };
    const shell=surface(rows,cols,sample,small?pearl:white,small?'lotus-small-petal':'lotus-large-petal');
    const colors=[];for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const v=.50+.50*Math.sin((.16+i/rows*.80)*Math.PI);colors.push(v,v,v);}
    shell.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));shell.material.vertexColors=true;
    // Clip ribbons from the actual faceted shell, then lift along its outward
    // normal. Resampling a different grid crossed the shell and made seams
    // flicker. All ribbon vertices now stay parallel to their source facet.
    const strip=(axis,lo,hi,material,name)=>{
      const positions=[],normals=[],indices=[],geo=shell.geometry,p=geo.attributes.position,ix=geo.index;
      const clip=(poly,limit,keepAbove)=>{
        const result=[];
        for(let i=0;i<poly.length;i++){
          const a=poly[i],b=poly[(i+1)%poly.length],insideA=keepAbove?a.uv[axis]>=limit:a.uv[axis]<=limit,insideB=keepAbove?b.uv[axis]>=limit:b.uv[axis]<=limit;
          if(insideA)result.push(a);
          if(insideA!==insideB){const f=(limit-a.uv[axis])/(b.uv[axis]-a.uv[axis]);result.push({p:a.p.clone().lerp(b.p,f),uv:a.uv.map((v,j)=>v+(b.uv[j]-v)*f)});}
        }return result;
      };
      for(let i=0;i<ix.count;i+=3){
        let poly=[0,1,2].map(j=>{const id=ix.getX(i+j);return {p:new THREE.Vector3().fromBufferAttribute(p,id),uv:[Math.floor(id/(cols+1))/rows,(id%(cols+1))/cols]};});
        const n=poly[1].p.clone().sub(poly[0].p).cross(poly[2].p.clone().sub(poly[0].p));if(n.lengthSq()<1e-16)continue;n.normalize();
        const centre=poly.reduce((a,v)=>a.add(v.p),new THREE.Vector3());if(n.x*centre.x+n.z*centre.z<0)n.negate();
        poly=clip(clip(poly,lo,true),hi,false);if(poly.length<3)continue;
        const start=positions.length/3;
        for(const v of poly){positions.push(...v.p.addScaledVector(n,.00045));normals.push(...n);}
        for(let j=1;j<poly.length-1;j++)indices.push(start,start+j,start+j+1);
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setIndex(indices);
      const ribbon=add(geometry,material,name);ribbon.castShadow=false;ribbon.userData.shellId=shell.uuid;
    };
    for(const edge of [0,1])strip(1,edge===0?0:.955,edge===0?.045:1,rib,'lotus-shell-seam');
    if(!small)strip(0,.4755,.4845,pearl,'lotus-panel-joint');
  }
  for(let i=0;i<27;i++)petal(i,27,true);
  for(let i=0;i<28;i++)petal(i,28,false);
  // Recessed entrance bays and low steps establish a public building scale.
  for(let i=0;i<12;i++){
    const a=i*tau/12,x=Math.cos(a)*rx*.78,z=Math.sin(a)*rz*.78;
    const door=box(x,.014,z,.014,.023,.005,mat('#4a6870'),'stadium-entry');
    door.rotation.y=-a+Math.PI/2;
    const lintel=add(new THREE.PlaneGeometry(.013,.002),light,'stadium-entry-light',Math.cos(a)*(rx*.78+.003),.027,Math.sin(a)*(rz*.78+.003));
    lintel.rotation.y=-a+Math.PI/2;lintel.castShadow=false;
  }
  for(let i=0;i<3;i++){const z=d*.40-i*.007,top=.004+i*.002,bottom=Math.sqrt((radius+.006)**2-(w*.11)**2-(z+.004)**2)-(radius+.014);box(0,(top+bottom)/2,z,w*.22,top-bottom,.008,mat('#b9c3be'),'stadium-entry-step');}
  return g;
}
