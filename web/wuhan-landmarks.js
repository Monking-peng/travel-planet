import {crane} from './wuhan-crane.js';
import {roof,stairs,plaque,rail,tree} from './wuhan-architecture.js';
import {yangtzeBridge} from './wuhan-bridge.js';
import {qingchuan,guishan} from './wuhan-hanyang.js';
import {jianghan} from './wuhan-customs.js';
import {greenland} from './wuhan-greenland.js';
import {hanShow,hubeiMuseum} from './wuhan-culture.js';
import * as THREE from 'three';
import {eastlake} from './wuhan-eastlake.js';
import {universityCampus as university} from './wuhan-campus.js';
import {hankouArtMuseum,baotong} from './wuhan-more-landmarks.js';
import {guqintai} from './wuhan-guqintai.js';
import {gude,qintaiTheatre,wuhanStation,xinhai} from './wuhan-new-landmarks.js';
import {addLandmarkLife} from './wuhan-life.js';
export const LANDMARKS=[
  {id:'artmuseum',name:'武汉美术馆·汉口馆',area:'汉口 · 中山大道',x:-1.25,z:1.42,hemisphere:-1,height:.35,grounded:true,distance:2.7,view:[.3,.50,1.2],description:'原金城银行大楼的石色古典立面、六根通高柱、层叠檐口与馆前刻字景石。按汉口馆实拍制作，区别于琴台馆。',source:'https://hbwh.wenming.cn/zt2025/wcnrxwhdcs/whys/202509/t20250924_9034567.html'},
  {id:'baotong',name:'宝通寺·洪山宝塔',area:'武昌 · 洪山',x:1.62,z:.86,height:.85,grounded:true,distance:2.8,view:[.4,.5,1.2],description:'洪山宝塔的七层八角砖红塔身、灰色挑檐与金属塔刹，配合宝通禅寺赭黄院墙、山门和山坡。这里呈现寺院核心意象，非全寺复原。',source:'https://oasis.halfmoon.jp/traveldia2/china18/china18-03.html'},
  {id:'xinhai',name:'辛亥革命博物院',area:'武昌 · 首义南区',x:.78,z:1.72,height:.26,grounded:true,distance:2.9,view:[.15,.65,1.1],description:'选取南区的楚国红 V 形建筑：悬挑的折面外壳、两翼屋顶天窗与下沉式中央入口。与北区红楼是不同建筑，不混用造型。',source:'https://www.1911museum.cn/view_2932.html'},
  {id:'gude',name:'古德寺',area:'汉口 · 圆通宝殿',x:-1.51,z:-1.10,height:.48,grounded:true,distance:2.4,view:[.15,.45,1.1],description:'九座佛塔、尖拱廊柱与玫瑰花窗，以米黄色石材表现圆通宝殿融合多种建筑语汇的轮廓。院前保留香炉与林荫。',source:'https://www.wuhan.gov.cn/zjwh/whly/202506/t20250628_2602209.shtml'},
  {id:'qintai',name:'琴台大剧院',area:'汉阳 · 月湖',x:-1.02,z:1.55,rotation:Math.PI/2,height:.43,grounded:true,distance:3.0,view:[.35,.55,1.1],description:'以实景中展开的 V 形巨构、起翘金属屋盖和通透玻璃门厅构成琴台轮廓。夜景以暖金色建筑照明与冷色玻璃形成层次。',source:'https://hanyang.hmltec.com/index.php?c=show&id=339'},
  {id:'station',name:'武汉站',area:'青山 · 高铁门户',x:-1.48,z:-1.15,hemisphere:-1,height:.35,grounded:true,distance:3.5,view:[.15,.70,1.1],description:'九片连续波浪形白色屋盖，中部抬升如展翅黄鹤；下方是通透站厅、分叉支撑与到达广场。建筑按实拍轮廓做微缩表达。',source:'https://megaconstrucciones.net/?construccion=estacion-wuhan'},
  {id:'guqintai',name:'古琴台',area:'汉阳 · 月湖',x:-1.72,z:.37,height:.24,grounded:true,distance:2.6,view:[.3,.95,1.1],description:'以古琴台门楼、庭院、琴台与深绿瓦廊还原知音园林的层次。石色门柱、透空门洞和林荫围合保留实景特征。',source:'https://hanyang.hmltec.com/index.php?c=show&id=8'},
  {id:'university',name:'武汉大学',area:'珞珈山 · 樱花大道',x:-.25,z:.05,hemisphere:-1,height:.60,focusY:.12,focusZ:.17,grounded:true,distance:3.85,view:[1.3,.75,1.1],description:'老图书馆、四组老斋舍和三道拱门沿山势展开，44 株樱花组成连续大道。以春季盛花为主题；暖色步道灯和花下照明属于夜景艺术设计。',source:'https://news.whu.edu.cn/info/1002/46686.htm'},
  {id:'eastlake',name:'东湖·碧潭观鱼',area:'东湖 · 听涛',x:1.70,z:.55,hemisphere:-1,height:.22,grounded:true,distance:3.5,view:[.3,1.1,1],description:'绿色攒尖亭、白色曲桥与开敞水院，周围以水杉和林带围合，保留东湖的开阔水面。',source:'https://www.new-broad.com/index.php?a=show&c=index&catid=13&id=7514&m=content'},
  {id:'han',name:'汉秀剧场',area:'武昌 · 楚河汉街',x:1.25,z:-.28,height:.40,grounded:true,distance:2.1,view:[.6,.55,1.1],description:'红灯笼般的鼓形外壳，银色交叉网格包覆立面，底层为通透玻璃门厅。夜间红色光阵缓慢明暗变化。',source:'https://stufish.com/project/the-han-show-theatre/'},
  {id:'museum',name:'湖北省博物馆',area:'东湖 · 楚文化',x:1.20,z:-1.14,hemisphere:-1,height:.44,grounded:true,distance:2.9,view:[.6,.95,1.1],description:'以青灰色层叠屋盖、对称展馆、庭院和水院展现楚式建筑意象。这里选取主馆群的识别轮廓，不代表全部展馆和完整场地。',source:'https://hbsbwg.cjyun.org/xwdt/p/7839.html'},
  {id:'greenland',name:'武汉绿地中心',area:'武昌 · 滨江',x:.67,z:-1.07,height:1.31,grounded:true,distance:3.6,view:[.6,.35,1],description:'三瓣弧形玻璃塔身逐渐收窄，保留建成后的平顶与停机坪。玻璃窗带和竖向灯带缓慢变化，不使用早期未建成的尖顶方案。',source:'https://www.skyscrapercenter.com/building/id/33983'},
  {id:'customs',name:'江汉关',area:'汉口 · 江汉路',x:-.73,z:-.88,height:.635,grounded:true,rotation:Math.PI/2,distance:2.15,view:[.5,.6,1.2],description:'浅色石材、通高柱廊、四面钟盘和八角钟亭。主立面转向长江，保留江汉路口的开敞空间。',source:'https://sw.wuhan.gov.cn/xwdt/gzdt/202509/t20250904_2643497.shtml'},
  {id:'qingchuan',name:'晴川阁',area:'汉阳 · 禹功矶',x:-.67,z:.20,height:.37,grounded:true,rotation:Math.PI/2,distance:1.9,view:[.5,.85,1.1],description:'灰瓦重檐、朱色柱廊和弧形临江平台，后接禹稷行宫与庭院。与黄鹤楼隔江相望。',source:'https://english.wuhan.gov.cn/H_1/NWP/202211/t20221101_2080035.shtml'},
  {id:'guishan',name:'龟山电视塔',area:'汉阳 · 龟山',x:-1.10,z:.81,lift:.10,height:.94,grounded:true,distance:2.8,view:[-.5,.4,1],description:'白色细长塔身、层叠的环形观景台和红白天线，立于龟山林冠之上。',source:'https://english.wuhan.gov.cn/H_1/NWP/202211/t20221101_2080035.shtml'},
  {id:'bridge',name:'武汉长江大桥',area:'两江 · 一桥两山',x:.07,z:.60,height:.30,grounded:true,distance:2.6,view:[0,.65,-1.2],description:'上层公路、下层铁路，通透的连续钢桁架落在江中桥墩上。两端的灰色桥头堡连接龟山与蛇山。',source:'https://3g.wuhan.gov.cn/sy/whyw/202212/t20221212_2114209.shtml'},
  {id:'crane',name:'黄鹤楼',area:'武昌 · 蛇山',x:.78,z:.96,lift:.105,height:.92,grounded:true,distance:2.8,view:[.35,.34,1.2],description:'金色琉璃瓦与红褐色柱廊层层收分，飞檐、回廊和山前石阶面向长江。保留蛇山与龟山隔江相望的关系。',source:'https://www.wuchang.gov.cn/zjwc/wcly/you/zmjd/202005/t20200507_1241541.html'},
];
const builders={artmuseum:hankouArtMuseum,baotong,xinhai,gude,qintai:qintaiTheatre,station:wuhanStation,crane,bridge:yangtzeBridge,qingchuan,guishan,customs:jianghan,greenland,han:hanShow,museum:hubeiMuseum,eastlake,university,guqintai};
const order=['crane','bridge','qingchuan','guishan','customs','greenland','han','university','museum','eastlake','guqintai','gude','qintai','station','xinhai','artmuseum','baotong'];LANDMARKS.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
export function createLandmark(k,id){const g=builders[id]?builders[id](k):new THREE.Group();g.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});addLandmarkLife(k,g,id);const scale={qingchuan:1.10,guishan:1.0,customs:1.10,greenland:1.10,han:1.12,museum:1.10,guqintai:1.08,gude:1.10,qintai:1.06,xinhai:1.10}[id]||1;g.scale.multiplyScalar(scale);if(id==='guishan')g.scale.y*=1.14;return g;}
