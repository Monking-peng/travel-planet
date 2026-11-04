import {south,wuhua,yan,shaxi} from './dali-oldtown.js';
import {pagodas,putuo,xingsheng} from './dali-water.js';
import {cangshan} from './dali-mountain.js';
export const LANDMARKS=[
 {
  "id": "pagodas",
  "name": "崇圣寺三塔",
  "area": "千寻方塔 · 两座八角塔",
  "x": -1.08,
  "z": 0.94,
  "height": 1.12,
  "distance": 3.15,
  "view": [
   -0.6,
   0.75,
   1.9
  ],
  "description": "十六层千寻方塔居前，两座十层八角塔在后方分立；米白砖身、密檐、佛龛、角柱与莲瓣平座层层收分，金属塔刹点出轮廓。夜间柔光保留砖石层次，塔前水池与石径相映。",
  "source": "https://www.ecns.cn/hd/2018-09-13/detail-ifyxxzwt9219171.shtml",
  "grounded": true
 },
 {
  "id": "south",
  "name": "大理古城南门",
  "area": "文献名邦 · 双层城楼",
  "x": 1.08,
  "z": 0.94,
  "height": 0.82,
  "distance": 3.1,
  "view": [
   0.3,
   0.65,
   1.9
  ],
  "description": "宽阔石砌城墙托起双层挑檐城楼，蓝绿彩绘斗拱、朱柱与红灯笼围绕四块「文献名邦」竖匾。中央和两侧门洞连接缓坡石径，夜间暖光照亮檐下与砖石。",
  "source": "https://www.feastographyblog.com/blog/dali-ancient-city",
  "grounded": true
 },
 {
  "id": "wuhua",
  "name": "五华楼",
  "area": "三重飞檐 · 古城楼阁",
  "x": -1.08,
  "z": -0.94,
  "height": 1.0,
  "distance": 3.1,
  "view": [
   0.3,
   0.65,
   1.9
  ],
  "description": "三重灰瓦飞檐和顶端宝瓶勾勒楼阁轮廓，红柱、蓝绿彩梁、层叠斗拱与木格门窗围合回廊。下方石砌拱门连通街道，夜间暖光照亮檐下和门洞。",
  "source": "https://www.visitourchina.com/dali/attraction/the-ancient-city-of-dali.html",
  "grounded": true
 },
 {
  "id": "yan",
  "name": "喜洲·严家大院",
  "area": "三坊一照壁 · 白族院落",
  "x": 1.08,
  "z": -0.94,
  "height": 0.43,
  "distance": 3.25,
  "view": [
   0.3,
   1.25,
   1.8
  ],
  "description": "蓝白彩绘照壁与层叠门楼围合院落，红木双层回廊、雕花窗格、灯笼和盆栽相映。后方小洋楼保留粉白墙身、拱窗阳台与石栏；这里呈现一组代表性庭院。",
  "source": "https://bau.com.hk/web/article/1305292658495438848/web/content_1305292658495438848.html",
  "grounded": true
 },
 {
  "id": "putuo",
  "name": "洱海·小普陀",
  "area": "湖心石岛 · 观音阁",
  "x": -1.08,
  "z": 0.94,
  "height": 0.64,
  "distance": 3.1,
  "view": [
   0.3,
   0.75,
   1.9
  ],
  "description": "两层观音阁立在湖中礁石上，灰瓦翘角、蓝白墙面与岛边古树相映，水面上点缀白鸥。",
  "source": "https://touch.travel.qunar.com/comment/5971508",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "cangshan",
  "name": "苍山·洗马潭",
  "area": "山脊环抱 · 高山潭水",
  "x": 1.08,
  "z": 0.94,
  "height": 0.65,
  "distance": 3.3,
  "view": [
   0.35,
   1.2,
   1.8
  ],
  "description": "起伏山脊和高山灌丛围住清蓝潭水，浅色栈道沿坡地转折，观景平台望向苍山深处。",
  "source": "https://gs.ctrip.com/html5/you/sight/dalicity1445616/1834533.html",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "xingsheng",
  "name": "下关·兴盛大桥",
  "area": "连拱桥身 · 石色塔柱",
  "x": -1.08,
  "z": -0.94,
  "height": 0.65,
  "distance": 3.25,
  "view": [
   0.4,
   0.65,
   1.9
  ],
  "description": "浅色连拱桥身横跨西洱河，四座塔柱、栏杆与路灯沿桥展开，保留桥洞和宽阔水面。",
  "source": "https://touch.travel.qunar.com/comment/17114421",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "shaxi",
  "name": "剑川沙溪·古戏台",
  "area": "茶马古道 · 三面观戏",
  "x": 1.08,
  "z": -0.94,
  "height": 0.9,
  "distance": 3.1,
  "view": [
   0.35,
   0.75,
   1.9
  ],
  "description": "石砌台脚托起开放木戏台，蓝金彩绘门楣、木格窗与灰瓦翘檐围绕后方魁星阁。两侧为相连的旧铺面，夜间暖光落在梁枋与檐下；此处位于大理州剑川县。",
  "source": "https://touch.go.qunar.com/poi/5942814",
  "grounded": true,
  "hemisphere": -1
 }
];
const builders={south,wuhua,yan,shaxi,pagodas,putuo,xingsheng,cangshan};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Dali landmark: ${id}`);return builders[id](k);}
