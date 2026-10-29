import {PLACEMENTS} from './planet-layout.js';
import {INSPECTION_BOUNDS} from './planet-inspection-bounds.js';
export const COMPONENTS=[
  {id:'bridge',name:'白堤小桥',category:'杭州风景',position:[-.31,-.33,.026],turn:-.16},
  {id:'pagoda',name:'雷峰小塔',category:'杭州风景',position:[.76,.43,.012],turn:.12},
  {id:'pavilion',name:'湖心小亭',category:'杭州风景',position:[-.55,.35,.02]},
  {id:'towers',name:'三潭石塔',category:'杭州风景',position:[.16,.04,.02]},
  {id:'mountains',name:'西山叠翠',category:'自然',position:[-.54,.99,-.02]},
  {id:'tea',name:'一小片茶园',category:'自然',position:[-.8,-.5,.012],turn:.2},
  {id:'bamboo',name:'竹影小径',category:'自然',position:[-1.04,.35,.01]},
  {id:'boat',name:'西湖摇橹船',category:'自然',position:[.46,-.27,.02],turn:.2},
  {id:'twinTowers',name:'城市玻璃双塔',category:'城市',position:[.44,.99,.012],turn:-.16},
  {id:'apartments',name:'湖滨露台酒店',category:'城市',geo:[72,12],turn:-.1},
  {id:'cafe',name:'湖滨 in77 与 Apple',category:'城市',position:[.77,-.52,.015],turn:-.3},
  {id:'gallery',name:'花瓣展馆',category:'城市',geo:[17,-13]},
  {id:'wheel',name:'城市摩天轮',category:'城市',geo:[-95,38],turn:.12},
  {id:'tram',name:'珊瑚色电车',category:'城市',geo:[-25,-6],turn:.08},
  {id:'goldenBall',name:'国际会议中心 · 大金球',category:'城市',geo:[130,32],turn:-.12,isNew:true},
  {id:'skyline',name:'阶梯写字楼',category:'城市',geo:[-136,28],turn:.1,isNew:true},
  {id:'courtyard',name:'江南小院',category:'杭州风景',geo:[178,-4],turn:0,isNew:true},
  {id:'clockTower',name:'滨水钟楼',category:'城市',geo:[102,-23],turn:.12,isNew:true},
  {id:'greenhouse',name:'玻璃花房',category:'城市',geo:[-85,-22],turn:0,isNew:true},
  {id:'camping',name:'湖边营地',category:'自然',geo:[-172,65],turn:.2,isNew:true},
  {id:'lotusPier',name:'荷塘木栈道',category:'自然',geo:[155,11],turn:.15,isNew:true},
  {id:'fountain',name:'喷泉小广场',category:'城市',geo:[-139,-22],turn:0,isNew:true},
].map(c=>{const p=PLACEMENTS.find(p=>p.id===c.id);const {position,...info}=c;return {...info,geo:p.geo,turn:p.turn||0,scale:p.scale,district:p.district};});
// The library size is not a per-planet quota: every different piece can coexist.
export const MAX_COMPONENTS=COMPONENTS.length;
export const LEGACY_DEFAULT=['bridge','pagoda','mountains','boat','twinTowers','cafe'];
export const PREVIOUS_DEFAULT=['bridge','pagoda','pavilion','towers','mountains','boat','twinTowers','cafe','apartments','gallery','tram','goldenBall','skyline','courtyard','clockTower','greenhouse','camping','lotusPier'];
export const PRESETS=[
  {id:'city',name:'西湖与湖滨',note:'湖上慢游，沿岸逛逛',items:['bridge','pagoda','pavilion','towers','mountains','boat','cafe','apartments','courtyard','lotusPier','tea']},
  {id:'lake',name:'西湖慢游',note:'桥、亭、茶园和三潭',items:['bridge','pagoda','pavilion','towers','mountains','tea','bamboo','boat','courtyard','greenhouse','camping','lotusPier']},
  {id:'weekend',name:'城市周末',note:'看展，喝咖啡，坐电车',items:['bridge','boat','twinTowers','apartments','cafe','gallery','wheel','tram','goldenBall','skyline','clockTower','fountain']},
  {id:'garden',name:'城中花园',note:'小院、花房和金色天际线',items:['pavilion','tea','bamboo','boat','cafe','gallery','goldenBall','greenhouse','courtyard','fountain','clockTower','lotusPier']},
  {id:'nature',name:'湖畔野趣',note:'露营、看荷花，去茶园走走',items:['camping','lotusPier','tea','bamboo','bridge','pavilion','towers','mountains','boat','courtyard','greenhouse']},
];
export const DEFAULT_COMPONENTS=PRESETS[0].items;
// Overview destinations change only the camera. In particular, the river is
// fixed landscape and must remain reachable without adding any optional piece.
export function overviewView(id){
  const views={
    lake:{x:-.35,y:-.20,z:.25,offsetY:0,zoom:2},
    lingyin:{"x": 2.8099800957108707, "y": 1.2217304763960308, "z": -3.141592653589793, "offsetY": -1.10, "zoom": 3.0},
    heritage:{x:2.705260340591211,y:.8901179185171084,z:-Math.PI,offsetY:-1.12,zoom:2.4},
    hubin:{x:-.25,y:-.70,z:.10,offsetY:0,zoom:1.02},
    river:{x:-108*Math.PI/180,y:-162*Math.PI/180,z:0,offsetY:-.69,zoom:1.9},
    // Frame the skyline and lotus together, with less empty river foreground.
    southbank:{x:-3.0543261909900767,y:.7504915783575616,z:0,offsetY:-1.13,zoom:2.9},
  };
  return Object.hasOwn(views,id)?{...views[id]}:null;
}
export function normalizeSelection(value){if(!Array.isArray(value))return [...DEFAULT_COMPONENTS];return [...new Set(value)].filter(id=>COMPONENTS.some(c=>c.id===id));}
export function restoreSelection(value){if(Array.isArray(value)&&value.length===LEGACY_DEFAULT.length&&LEGACY_DEFAULT.every(id=>value.includes(id)))return [...DEFAULT_COMPONENTS];return normalizeSelection(value);}
export function restorePreviousSelection(value){if(Array.isArray(value)&&value.length===PREVIOUS_DEFAULT.length&&PREVIOUS_DEFAULT.every(id=>value.includes(id)))return [...DEFAULT_COMPONENTS];return normalizeSelection(value);}
export function toggleComponent(value,id){const current=normalizeSelection(value);if(!COMPONENTS.some(c=>c.id===id))return {selected:current,invalid:true};return {selected:current.includes(id)?current.filter(x=>x!==id):[...current,id]};}
export function inspectionView(id,width,height){
  const view=focusAngles(id),bounds=INSPECTION_BOUNDS[id];if(!view||!bounds||!(width>0&&height>0))return view;
  const [min,max]=bounds,center=min.map((n,i)=>(n+max[i])/2),aspect=width/height,f=1/Math.tan(17*Math.PI/180),s=1/Math.hypot(1,6.2),c=6.2/Math.hypot(1,6.2);
  let offsetY=.2+center[2]/6.2-center[1],extentX=0,extentY=0;
  for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]]){const depth=s*(1.2-y-offsetY)+c*(6.2-z);extentX=Math.max(extentX,Math.abs(f*x/aspect/depth));extentY=Math.max(extentY,Math.abs(f*(c*(y+offsetY-1.2)-s*(z-6.2))/depth));}
  const zoom=Math.max(.8,Math.min(id==='lotusPier'?7:3.6,.80/Math.max(extentX,.001),.57/Math.max(extentY,.001))),depth=s*(1.2-center[1]-offsetY)+c*(6.2-center[2]);
  // Frame the full silhouette slightly above centre, with lake/ground below.
  offsetY+=.24*depth/(f*zoom*c+.24*s);
  return {...view,zoom,offsetY};
}
export function focusAngles(id){
  const c=COMPONENTS.find(c=>c.id===id);if(!c)return null;
  const [lon,lat]=c.geo.map(n=>n*Math.PI/180),a=Math.cos(c.turn||0),b=Math.sin(c.turn||0);
  const up=[Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat)],e=[Math.cos(lon),0,-Math.sin(lon)],s=[Math.sin(lon)*Math.sin(lat),-Math.cos(lat),Math.cos(lon)*Math.sin(lat)];
  const east=e.map((n,i)=>n*a-s[i]*b),south=e.map((n,i)=>n*b+s[i]*a),tilt=(id==='boat'?53:id==='cafe'?80:65)*Math.PI/180,yaw=id==='boat'?-.38:0,ct=Math.cos(tilt),st=Math.sin(tilt),cy=Math.cos(yaw),sy=Math.sin(yaw);
  // Look slightly along the boat to show the open cabin and curved canopy.
  const target=[[cy,sy*ct,-sy*st],[0,st,ct],[sy,-cy*ct,cy*st]],source=[east,up,south];
  const m=Array.from({length:3},(_,r)=>Array.from({length:3},(_,col)=>source.reduce((sum,v,i)=>sum+target[i][r]*v[col],0)));
  const y=Math.asin(Math.max(-1,Math.min(1,m[0][2]))),x=Math.abs(m[0][2])<.9999999?Math.atan2(-m[1][2],m[2][2]):Math.atan2(m[2][1],m[1][1]),z=Math.abs(m[0][2])<.9999999?Math.atan2(-m[0][1],m[0][0]):0;
  return {x,y,z,offsetY:-1.05,zoom:3.6};
}
