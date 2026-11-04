import {elephant,moon,xingping} from './guilin-karst.js';
import {twins,jingjiang,xiaoyao} from './guilin-heritage.js';
import {fuli,longji} from './guilin-terraces.js';
export const LANDMARKS=[
 {
  "id": "elephant",
  "name": "象鼻山·水月洞",
  "area": "漓江水岸 · 石山穿洞",
  "x": -1.08,
  "z": 0.94,
  "height": 0.64,
  "distance": 3.15,
  "view": [
   -0.65,
   0.72,
   1.9
  ],
  "description": "石灰岩山体俯向漓江，水月洞贯通山脚，灰白崖壁、青绿山顶和竹筏构成桂林的山水轮廓。",
  "source": "https://www.pelago.com/en-AU/activity/p0zy70bfn-private-guilin-half-day-tour-fubo-mountain-reed-flute-cave-and-elephant-hill-guilin/",
  "grounded": true
 },
 {
  "id": "twins",
  "name": "杉湖·日月双塔",
  "area": "九层铜塔 · 七层琉璃塔",
  "x": 1.08,
  "z": 0.94,
  "height": 1.22,
  "distance": 3.45,
  "view": [
   0.7,
   0.75,
   1.9
  ],
  "description": "九层铜色日塔与七层青瓦月塔隔水相映，八角回廊、格窗、栏杆与瓦脊逐层收分。夜间金色与冷白色柔光映入杉湖，水纹随视角缓慢变化。",
  "source": "https://www.glljsh.com/tms/ticket/81.html",
  "grounded": true
 },
 {
  "id": "jingjiang",
  "name": "靖江王府·独秀峰",
  "area": "王城门楼 · 孤峰拔地",
  "x": -1.08,
  "z": -0.94,
  "height": 0.77,
  "distance": 3.3,
  "view": [
   0.42,
   0.87,
   1.9
  ],
  "description": "黄色承运门的三组高低屋顶向两翼展开，红木格窗与石砌拱圈围住通道；石阶连通前庭，灰岩独秀峰与峰顶小亭立在后方。",
  "source": "https://gs.ctrip.com/html5/you/sight/guilin28/5066548.html",
  "grounded": true
 },
 {
  "id": "xiaoyao",
  "name": "逍遥楼",
  "area": "漓江楼阁 · 三重檐顶",
  "x": 1.08,
  "z": -0.94,
  "height": 0.85,
  "distance": 3.15,
  "view": [
   0.3,
   0.65,
   1.9
  ],
  "description": "三重灰瓦深檐与木斗拱层层上收，白墙木窗和透空回廊围住二楼；底层门廊连通宽石阶，暖光勾勒木柱、屋檐和白石台座。",
  "source": "https://k.sina.cn/article_1608094690_5fd993e200100xofg.html",
  "grounded": true
 },
 {
  "id": "xingping",
  "name": "阳朔·兴坪漓江",
  "area": "峰林倒影 · 竹筏缓行",
  "x": -1.08,
  "z": 0.94,
  "height": 0.86,
  "distance": 3.4,
  "view": [
   0.25,
   0.8,
   1.9
  ],
  "description": "高低错落的灰岩峰林保留宽阔山肩和陡直崖面，斑驳绿意沿石缝展开；连绵竹林贴着弯曲江岸，竹筏驶过开阔漓江。",
  "source": "https://www.news.cn/photo/2022-10/10/c_1129058493_3.htm",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "fuli",
  "name": "阳朔·富里桥",
  "area": "单孔石拱 · 遇龙河源流",
  "x": 1.08,
  "z": 0.94,
  "height": 0.51,
  "distance": 3.45,
  "view": [
   0.3,
   0.65,
   1.9
  ],
  "description": "灰青石阶沿单拱逐级抬高，风化砌石和拱圈围住贯通河道；两岸古榕伸出层叠树冠，桥头铺面顺坡接地，竹筏穿行水面。",
  "source": "https://www.weather.com.cn/guangxi/gxgqtp/3306066.shtml",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "longji",
  "name": "龙胜·龙脊梯田",
  "area": "等高田埂 · 层层山田",
  "x": -1.08,
  "z": -0.94,
  "height": 0.4,
  "distance": 3.3,
  "view": [
   0.3,
   1.55,
   1.7
  ],
  "description": "起伏山脊上铺开金绿相间的等高稻田，宽窄不同的田面与土埂连成层次；步道跨过山田，通向高处的观景台。位于桂林市龙胜各族自治县。",
  "source": "https://www.news.cn/photo/20261015/91606c04821f40df9dab9de3b2d471a5/c.html",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "moon",
  "name": "阳朔·月亮山",
  "area": "天然石拱 · 青峰如月",
  "x": 1.08,
  "z": -0.94,
  "height": 0.8,
  "distance": 3.25,
  "view": [
   0.1,
   0.65,
   1.9
  ],
  "description": "灰白岩壁上的月形石洞贯穿山脊，连绵绿坡托起天然石拱，前景树冠压低，让山体成为主角。",
  "source": "https://www.visitourchina.com/yangshuo/attraction/the-moon-hill.html",
  "grounded": true,
  "hemisphere": -1
 }
];
const builders={elephant,moon,xingping,twins,jingjiang,xiaoyao,fuli,longji};
export function createLandmark(k,id){if(!builders[id])throw new Error('Unknown Guilin landmark: '+id);return builders[id](k);}
