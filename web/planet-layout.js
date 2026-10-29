// Artistic spherical atlas: West Lake in front, Hubin on its east shore.
export const PLANET_RADIUS=1.42;
export const GRID_SIZE=12;
export const DISTRICTS=[{id:'lake',name:'西湖',longitude:0},{id:'street',name:'湖滨',longitude:55},{id:'city',name:'城市后街',longitude:150},{id:'park',name:'西山',longitude:270}];
export const PLACEMENTS=[
  {id:'bridge',district:'lake',geo:[24,32],scale:.64,elevation:-.032,turn:-.117,terrain:'bridge',ports:[[9.82,32.61],[37.77,29.85]]},
  {id:'pagoda',district:'lake',geo:[-45,-39],scale:.58,terrain:'land',turn:Math.PI,road:[-50,-20]},
  {id:'pavilion',district:'lake',geo:[-15,41],scale:.30,terrain:'land',road:[-14,34]},
  {id:'towers',district:'lake',geo:[-9,-20],scale:.65,terrain:'water'},
  {id:'boat',district:'lake',geo:[15,-5],scale:.80,elevation:.003,terrain:'water',turn:.35},
  {id:'lotusPier',district:'lake',geo:[35,0],scale:.70,terrain:'shore',road:[46,0]},
  {id:'cafe',district:'street',geo:[64,7],scale:1,elevation:.004,terrain:'land',turn:-Math.PI/2,road:[46,7],flushGround:true},
  {id:'apartments',district:'street',geo:[55,44],scale:.84,elevation:.004,terrain:'land',turn:-Math.PI/2,via:[[39,42]],road:[42,32],flushGround:true},
  {id:'courtyard',district:'lake',geo:[-12,67],scale:.60,terrain:'land',road:[-8,56]},
  {id:'gallery',district:'street',geo:[98,9],scale:.68,terrain:'land',road:[98,-16]},
  {id:'fountain',district:'street',geo:[81,-37],scale:.70,terrain:'land',turn:Math.PI,road:[82,-16]},
  {id:'twinTowers',district:'city',geo:[114,40],scale:.50,terrain:'land',road:[120,48],turn:Math.PI},
  {id:'skyline',district:'city',geo:[155,38],scale:.65,terrain:'land',road:[150,25]},
  {id:'goldenBall',district:'city',geo:[172,-30],scale:.65,terrain:'land',road:[166,-39],turn:0},
  {id:'clockTower',district:'city',geo:[211,15],scale:.62,terrain:'land',road:[208,2]},
  {id:'wheel',district:'city',geo:[228,-28],scale:.68,terrain:'land',turn:Math.PI,road:[226,-8]},
  {id:'tram',district:'city',geo:[122,-15],scale:.85,terrain:'rail'},
  {id:'mountains',district:'park',geo:[-64,32],scale:.95,turn:Math.PI/2,terrain:'land',via:[[-45,48]],road:[-42,42],surfaceEntrance:true,flushGround:true},
  {id:'tea',district:'park',geo:[260,15],scale:1,terrain:'land',road:[260,2]},
  {id:'bamboo',district:'park',geo:[277,-18],scale:.85,terrain:'land',turn:Math.PI,road:[280,0]},
  {id:'camping',district:'park',geo:[243,-14],scale:.80,terrain:'land',turn:Math.PI,road:[240,2]},
  {id:'greenhouse',district:'park',geo:[147,0],scale:.73,terrain:'land',turn:Math.PI,road:[150,25]},
];
export const ENTRANCES={pagoda:[0,.316],pavilion:[0,.20],lotusPier:[.300,.025],cafe:[0,.37],courtyard:[0,.26],gallery:[0,.35],fountain:[0,.25],twinTowers:[0,.204],skyline:[0,.195],goldenBall:[0,.21],apartments:[0,.20],clockTower:[0,.225],wheel:[0,.135],mountains:[.45,.20],tea:[0,.23],bamboo:[0,.13],camping:[-.05,.25],greenhouse:[0,.30]};
export function roundOutline(input,passes=2){let p=input;for(let k=0;k<passes;k++){const next=[];p.forEach((a,i)=>{const b=p[(i+1)%p.length];next.push(a.map((x,j)=>x*.8+b[j]*.2),a.map((x,j)=>x*.2+b[j]*.8));});p=next;}return p;}
// Coordinates preserve the lake / city / causeway relationship, not actual distances.
export const LAKE_OUTLINE=roundOutline([[-30,-29],[-46,-12],[-47,14],[-40,36],[-24,51],[-5,52],[11,45],[25,35],[36,16],[37,-6],[26,-25],[2,-34],[-16,-34]],2);
export const LAKE_LAND=[
 {id:'gushan',outline:roundOutline([[-34,36],[-32,45],[-19,50],[-5,48],[4,42],[1,32],[-14,27],[-30,30]],1)},
 {id:'sudi',outline:[[-33,-35],[-33,53],[-19,53],[-19,-35]]},
 {id:'baidi',outline:roundOutline([[-27,36],[-12,36],[14,35],[14,31],[-12,32],[-27,33]],1)},
 {id:'xiaoyingzhou',outline:roundOutline([[-13,-6],[-9,1],[-3,2],[3,-3],[1,-12],[-7,-14],[-13,-10]],2)},
 {id:'ruangongdun',outline:roundOutline([[-21,6],[-18,10],[-14,9],[-13,5],[-17,3]],1)},
];
// Qiantang-inspired river district. These are artistic atlas coordinates,
// deliberately separated from West Lake, not a geographic or navigable map.
// Each cross-section is longitude / north bank / south bank. The same data
// drives the visible ribbon and terrain classification across the 180° seam.
const RIVER_CONTROL_POINTS=[
 [67,-49,-53],[79,-46,-58],[95,-46,-61],[111,-46,-63],
 [128,-43,-61],[145,-43,-60],[162,-45,-62],[179,-44,-63],
 [196,-42,-61],[213,-44,-61],[230,-49,-65],[247,-47,-63],
 [263,-47,-59],[276,-51,-55],
];
export const RIVER_COURSE=RIVER_CONTROL_POINTS.flatMap((a,i,points)=>{
 if(i===points.length-1)return [a];
 const b=points[i+1],prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+2)];
 return Array.from({length:8},(_,j)=>{
  const t=j/8,t2=t*t,t3=t2*t;
  const smooth=k=>.5*((2*a[k])+(-prev[k]+b[k])*t+(2*prev[k]-5*a[k]+4*b[k]-next[k])*t2+(-prev[k]+3*a[k]-3*b[k]+next[k])*t3);
  return [a[0]+(b[0]-a[0])*t,smooth(1),smooth(2)];
 });
});
export const REAR_WATER=[...RIVER_COURSE.map(([x,n])=>[x,n]),...RIVER_COURSE.map(([x,,s])=>[x,s]).reverse()];
export const RIVER_BRIDGE={longitude:179,north:-39,south:-66};
export const CONTEXT_PARCELS=[
 {id:'north-lane',district:'park',geo:[210,44],width:.38,depth:.24,scale:1,turn:0,terrain:'land',entrance:[0,.20],via:[[206,30],[201,20]],road:[208,2]},
 {id:'garden-lane',district:'park',geo:[231,17],width:.28,depth:.24,scale:1,turn:0,terrain:'land',entrance:[0,.15],road:[232,4.5]},
];
export const DISTRICT_GROUNDS=[
 {id:'hubin-promenade',district:'street',kind:'paving',outline:roundOutline([[39,28],[42,36],[67,53],[73,47],[70,27],[70,-8],[59,-23],[42,-17],[38,-10],[41,2]],1)},
 {id:'hubin-view',district:'street',kind:'lawn',keepOpen:true,outline:roundOutline([[38,13],[38,16],[43,16],[43,13]],2)},
 {id:'city-square',district:'city',kind:'meadow',outline:roundOutline([[95,29],[101,53],[132,53],[140,50],[170,52],[184,28],[194,19],[194,-7],[166,-10],[143,16],[125,26]],1)},
 {id:'city-common',district:'city',kind:'lawn',keepOpen:true,outline:roundOutline([[173,40],[173,52],[183,52],[183,40]],1)},
 {id:'woodland-slope',district:'park',kind:'meadow',outline:roundOutline([[234,12],[230,40],[249,64],[290,67],[310,43],[303,10],[274,0],[248,7]],2)},
];
export const FOREST_PARCELS=[
 // A connected grove occupies the unused strip between the rear street
 // blocks and the river district road, outside every optional building plot.
 {"id":"forest-city-river-belt","district":"city","geo":[170.5,-12],"size":[0.49,0.17],"kind":"forest-belt"},
 {"id":"forest-lake-belt-1","district":"park","geo":[-34,-57],"size":[0.4,0.28],"kind":"forest"},
];
export const RIVER_TREE_PARCELS=[
 {"id":"river-avenue-1-15-0","district":"park","geo":[93,-33.4795],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-32-0","district":"park","geo":[128,-30.5],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-45-0","district":"park","geo":[155.625,-31.8818],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-79-0","district":"park","geo":[227.875,-36.1895],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-82-0","district":"park","geo":[234.25,-36.4453],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-85-0","district":"park","geo":[240.625,-35.4111],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-88-0","district":"park","geo":[247,-34.5],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-91-0","district":"park","geo":[253,-34.1777],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-15-1","district":"park","geo":[93,-40.1795],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-80-1","district":"park","geo":[230,-43.2],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-83-1","district":"park","geo":[236.375,-42.8748],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-86-1","district":"park","geo":[242.75,-41.7234],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-89-1","district":"park","geo":[249,-41.077],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-12-2","district":"park","geo":[87,-27.8125],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-15-2","district":"park","geo":[93,-27.9795],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-18-2","district":"park","geo":[99,-28.0703],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-21-2","district":"park","geo":[105,-28.2197],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-24-2","district":"park","geo":[111,-28],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-31-2","district":"park","geo":[125.875,-25.252],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-45-2","district":"park","geo":[155.625,-26.3818],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-85-2","district":"park","geo":[240.625,-29.9111],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-88-2","district":"park","geo":[247,-29],"size":[0.08,0.08],"kind":"river-tree"},
 {"id":"river-avenue-1-91-2","district":"park","geo":[253,-28.6777],"size":[0.08,0.08],"kind":"river-tree"},
];
export const GARDENS=[
 {"id":"lingyin-forest-edge-0","district":"park","geo":[229,49],"size":[0.1,0.13],"kind":"wooded-hill","height":0.055,"trees":9},
 {"id":"lingyin-forest-edge-1","district":"park","geo":[275,57],"size":[0.1,0.13],"kind":"wooded-hill","height":0.055,"trees":9},

 {id:'lingyin-east-foothill',district:'park',geo:[271,40],size:[.16,.28],kind:'wooded-hill',height:.16,trees:24},
 {id:'lingyin-rear-ridge',district:'park',geo:[253,71],size:[.86,.32],kind:'wooded-hill',height:.30,trees:74},
 {id:'lingyin-west-ridge',district:'park',geo:[229,40],size:[.16,.24],kind:'wooded-hill',height:.14,trees:22},
 {id:'lingyin-temple',district:'park',geo:[250,46],size:[.50,.54],kind:'lingyin',scale:1,entrance:[0,.27],via:[[246,34],[247,25],[247,17],[244,10]],road:[240,2]},
 {"id":"olympic-lotus","district":"city","geo":[132.95000000000113,-69.2469669117646],"size":[0.32,0.22],"kind":"olympic-lotus","turn":2.3682784937334125,"scale":1,"entrance":[0,0.11],"road":[132.95000000000113,-61.64696691176461],"buffer":0.0015,"accessClearance":0.002},
 {"id":"binjiang-skyline","district":"city","geo":[162,-66.8],"size":[0.22,0.1],"kind":"southbank-skyline","scale":1,"entrance":[0,0.045],"road":[162,-63.1],"turn":-3.0733537007961798,"buffer":0.0015,"accessClearance":0.002},
 {"id":"river-tower-0","district":"city","geo":[99.04999999999835,-66.47243652343722],"size":[0.09570000000000001,0.112],"kind":"river-tower","height":0.31,"style":0,"welcome":false,"turn":1.6071937789420605,"scale":1,"entrance":[0.041194,0],"road":[99.04999999999835,-62.77243652343722],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 {"id":"river-tower-1","district":"city","geo":[108.94999999999892,-67.74465332031242],"size":[0.10439999999999999,0.112],"kind":"river-tower","height":0.41,"style":1,"welcome":true,"turn":1.809952868647868,"scale":1,"entrance":[0.044848,0],"road":[108.94999999999892,-64.04465332031242],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 {"id":"river-tower-2","district":"city","geo":[186,-67.08791360294117],"size":[0.09715,0.112],"kind":"river-tower","height":0.34,"style":2,"welcome":false,"turn":-2.3403925279178273,"scale":1,"entrance":[-0.041803,0],"road":[186,-63.387913602941175],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 {"id":"river-tower-3","district":"city","geo":[198.34999999999712,-65.66516544117663],"size":[0.10875,0.112],"kind":"river-tower","height":0.45,"style":0,"welcome":false,"turn":-2.0051701401137594,"scale":1,"entrance":[-0.046675,0],"road":[198.34999999999712,-61.96516544117662],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 {"id":"river-tower-4","district":"city","geo":[207.8999999999936,-65.45078124999984],"size":[0.0928,0.112],"kind":"river-tower","height":0.36,"style":1,"welcome":false,"turn":-1.8082675896239715,"scale":1,"entrance":[-0.039976,0],"road":[207.8999999999936,-61.75078124999984],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 {"id":"river-tower-5","district":"city","geo":[216.49999999998988,-66.47945772058581],"size":[0.10439999999999999,0.112],"kind":"river-tower","height":0.4,"style":2,"welcome":false,"turn":-1.6816540398033184,"scale":1,"entrance":[-0.044848,0],"road":[216.49999999998988,-62.77945772058581],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 {"id":"river-tower-6","district":"city","geo":[225.64999999998628,-69.10156249999635],"size":[0.0928,0.112],"kind":"river-tower","height":0.32,"style":0,"welcome":false,"turn":-1.5881360247344254,"scale":1,"entrance":[-0.039976,0],"road":[225.64999999998628,-65.40156249999634],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 {"id":"river-tower-7","district":"city","geo":[235.99999999998295,-69.61112132353095],"size":[0.09715,0.112],"kind":"river-tower","height":0.38,"style":1,"welcome":false,"turn":-1.4335590040551986,"scale":1,"entrance":[-0.041803,0],"road":[235.99999999998295,-65.91112132353095],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 {"id":"river-tower-8","district":"city","geo":[245.3499999999794,-68.10027573529787],"size":[0.09135,0.112],"kind":"river-tower","height":0.27,"style":2,"welcome":false,"turn":-1.2683269865126852,"scale":1,"entrance":[-0.039367,0],"road":[245.3499999999794,-64.40027573529787],"buffer":0.0015,"roadWidth":0.012,"accessClearance":0.002},
 ...RIVER_TREE_PARCELS,
 ...FOREST_PARCELS,
 {id:'hubin-north',district:'street',geo:[38.5,20],size:[.10,.09],kind:'willow'},
 {id:'hubin-south',district:'street',geo:[48,-24],size:[.15,.12],kind:'willow'},
 {id:'gushan-grove',district:'lake',geo:[-30,41],size:[.04,.05],kind:'bed'},
 {id:'south-bank',district:'lake',geo:[-25,-45],size:[.16,.15],kind:'willow'},
 {id:'west-grove',district:'park',geo:[-65,-8],size:[.35,.28],kind:'grove'},
 {id:'gushan-back',district:'lake',geo:[-38,60],size:[.18,.14],kind:'grove'},
 {id:'island-grove',district:'lake',geo:[-17,6.5],size:[.045,.045],kind:'grove'},
 {id:'north-ridge',district:'city',geo:[145,63],size:[.65,.28],kind:'hill'},
 {id:'city-garden-hill',district:'city',geo:[177,32],size:[.40,.24],kind:'hill'},
 {id:'south-garden-hill',district:'street',geo:[110,-38],size:[.42,.24],kind:'hill'},
 {id:'hangzhou-grand-theatre',district:'city',geo:[142,-26],size:[.44,.26],kind:'theatre',scale:1,entrance:[-.0704,.13],road:[140,-35]},
 // Two planted verges frame a clear central walk. The avenue stops before
 // the Gushan / Baidi junction, leaving the crossing and island views open.
 ...[-30.1,-21.9].flatMap((lon,side)=>Array.from({length:13},(_,i)=>({id:'sudi-willow-'+side+'-'+i,district:'lake',geo:[lon,-24+i*4.3],size:[.088,.082],kind:'willow'}))),
 // Explicit shore parcels join the causeway avenue to the wooded west hills.
 // Each parcel contains three offset trees; road, pier and shop approaches stay open.
 ...[
  ['south',-14,-43,.16,.13],['south',-3,-42,.16,.13],['south',7,-40,.16,.13],
  ['south',17,-41,.16,.13],['south',27,-40,.16,.13],['south',35,-34,.13,.11],
  ['south',40,-28,.13,.11],['south',24,-29,.10,.09],
  ['east',50,-17,.16,.13],['east',41,9,.16,.13],['east',49,27,.10,.09],
  ['east',31,-23,.10,.09],['east',38,-10,.10,.09],
  ['north',25,40,.10,.09],['north',18,56,.16,.13],['north',10,62,.10,.09],
  ['north',-35,53,.16,.13],['north',-3,41,.13,.11],
  ['west',-55,2,.16,.13],['west',-55,-8,.10,.09],['west',-56,-20,.16,.13],
 ].map(([sector,lon,lat,w,d],i)=>({id:'shore-'+sector+'-'+i,sector,district:sector==='east'?'street':'lake',geo:[lon,lat],size:[w,d],kind:'shore-grove'})),
];
export const STREET_PROPS=[
 ...[[42,24],[45,-17],[48,29]].map((geo,i)=>({id:'bench-'+i,type:'bench',geo,turn:-Math.PI/2})),
 ...[[40.5,26],[42,-6.5],[43,36],[48,-9]].map((geo,i)=>({id:'lamp-'+i,type:'lamp',geo})),
 ...[[46,17,'#c38b71'],[45,15,'#e4d0a5'],[46,5,'#5d7f8d'],[44,-11,'#d2ad73'],[49,32,'#749789'],[42,30.5,'#c99785'],[-26,4,'#9b806b'],[-3,34,'#80968b']].map(([lon,lat,color],i)=>({id:'visitor-'+i,type:'visitor',geo:[lon,lat],color})),
 ...[[37,21.5],[34.5,-16]].map((geo,i)=>({id:'railing-'+i,type:'railing',geo})),
];
export const BASES={pagoda:[.41,.41,8],pavilion:[.34,.32],courtyard:[.48,.4],gallery:[.52,.46],fountain:[.4,.38],twinTowers:[.5015,.3655],skyline:[.47,.39],goldenBall:[.48,.42],clockTower:[.34,.33],wheel:[.39,.27],tram:[.46,.2],tea:[.44,.34],camping:[.50,.38],greenhouse:[.45,.39]};
export const PUBLIC_ROADS=[
 {id:'lakeside-walk',points:[[-21,-38],[-34,-27],[-50,-20],[-49,10],[-42,42],[-26,49],[-26,55],[-8,56],[20,48],[42,32],[46,10],[46,0],[43,-10],[28,-32],[0,-35],[-21,-38]],width:.040},
 {id:'sudi-walk',points:[[-26,-35],[-26,-10],[-26,12],[-26,35],[-26,49]],width:.060},
 {id:'lake-walk',points:[[-26,35],[-14,34],[0,34],[14,33],[24,32],[34,31],[42,32]],width:.030},
 {id:'district-loop',points:[[43,-10],[82,-16],[100,-16],[122,-15],[160,-20],[194,-22],[226,-8]],width:.040},
 {id:'city-back-street',points:[[42,32],[75,29],[90,50],[120,48],[135,25],[150,25],[180,22],[208,2],[226,-8]],width:.038},
 {id:'water-garden-walk',points:[[100,-16],[121,-28],[125,-35],[140,-35],[153,-36],[166,-39],[184,-37],[200,-35],[215,-38],[225,-42],[214,-27],[215,-14],[226,-8]],width:.016},
 {id:'hill-path',points:[[-49,10],[-60,6],[-80,0],[-100,2],[-120,2],[-140,7],[-152,2]],width:.026},
];

export const radians=degrees=>degrees*Math.PI/180;
export function normalAt(lon,lat){const a=radians(lon),b=radians(lat);return [Math.sin(a)*Math.cos(b),Math.sin(b),Math.cos(a)*Math.cos(b)];}
export function frameAt(lon,lat){const a=radians(lon),b=radians(lat);return {up:normalAt(lon,lat),east:[Math.cos(a),0,-Math.sin(a)],south:[Math.sin(a)*Math.sin(b),-Math.cos(b),Math.cos(a)*Math.sin(b)]};}
export function geoAt([x,y,z]){return [Math.atan2(x,z)*180/Math.PI,Math.atan2(y,Math.hypot(x,z))*180/Math.PI];}
export function dot(a,b){return a.reduce((s,x,i)=>s+x*b[i],0);}
export function normalize(v){const l=Math.hypot(...v);return v.map(x=>x/l);}
export function pointInPolygon(point,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [x,y]=polygon[i],[px,py]=polygon[j];if(((y>point[1])!==(py>point[1]))&&point[0]<(px-x)*(point[1]-y)/(py-y)+x)inside=!inside;}return inside;}
export function terrainAt(normal){const geo=geoAt(normal),rear=[geo[0]+Math.round(((RIVER_COURSE[0][0]+RIVER_COURSE.at(-1)[0])/2-geo[0])/360)*360,geo[1]];return pointInPolygon(rear,REAR_WATER)||pointInPolygon(geo,LAKE_OUTLINE)&&!LAKE_LAND.some(s=>pointInPolygon(geo,s.outline))?'water':'land';}
export function inGround(normal,surface){const [longitude,latitude]=geoAt(normal),anchor=surface.outline[0][0];return pointInPolygon([longitude+Math.round((anchor-longitude)/360)*360,latitude],surface.outline);}
export function cubeNormal(face,u,v){
  const coords=[[1,v,-u],[-1,v,u],[u,1,-v],[u,-1,v],[u,v,1],[-u,v,-1]][face];
  return normalize(coords);
}
export function createGrid(size=GRID_SIZE){
  const cells=[];
  for(let face=0;face<6;face++)for(let row=0;row<size;row++)for(let col=0;col<size;col++){
    const u=col*2/size-1,v=row*2/size-1,s=2/size;
    cells.push({id:`${face}:${row}:${col}`,face,row,col,center:cubeNormal(face,u+s/2,v+s/2),corners:[[u,v],[u+s,v],[u+s,v+s],[u,v+s]].map(([a,b])=>cubeNormal(face,a,b))});
  }
  return cells;
}
export function polygonsOverlap(a,b){
  for(const poly of [a,b])for(let i=0;i<poly.length;i++){
    const p=poly[i],q=poly[(i+1)%poly.length],axis=[p[1]-q[1],q[0]-p[0]],project=v=>v[0]*axis[0]+v[1]*axis[1];
    const av=a.map(project),bv=b.map(project);
    if(Math.max(...av)<=Math.min(...bv)+1e-8||Math.max(...bv)<=Math.min(...av)+1e-8)return false;
  }
  return true;
}
export function placementFrame(placement){
  const f=frameAt(...placement.geo),c=Math.cos(placement.turn||0),s=Math.sin(placement.turn||0);
  const east=f.east.map((x,i)=>x*c-f.south[i]*s),south=f.east.map((x,i)=>x*s+f.south[i]*c);
  return {up:f.up,east,south};
}
export function footprintFrame(placement,bounds,buffer=.025){
  const f=placementFrame(placement),{east,south}=f;
  const scale=placement.scale,polygon=[[bounds.min[0]*scale-buffer,bounds.min[2]*scale-buffer],[bounds.max[0]*scale+buffer,bounds.min[2]*scale-buffer],[bounds.max[0]*scale+buffer,bounds.max[2]*scale+buffer],[bounds.min[0]*scale-buffer,bounds.max[2]*scale+buffer]];
  const world=polygon.map(([x,z])=>normalize(f.up.map((y,i)=>y*PLANET_RADIUS+east[i]*x+south[i]*z)));
  return {up:f.up,east,south,polygon,world};
}
export function projectToFrame(normal,frame){const depth=dot(normal,frame.up);if(depth<=0)return null;return [dot(normal,frame.east)*PLANET_RADIUS/depth,dot(normal,frame.south)*PLANET_RADIUS/depth];}
export function footprintCells(frame,grid=createGrid()){
  return grid.filter(cell=>{
    if(dot(cell.center,frame.up)<.75)return false;
    const points=cell.corners.map(n=>projectToFrame(n,frame));return points.every(Boolean)&&polygonsOverlap(frame.polygon,points);
  }).map(c=>c.id);
}
