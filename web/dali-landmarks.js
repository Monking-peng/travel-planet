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
  "description": "石砌城台托起双层城楼，朱柱与青蓝彩梁之间悬挂红灯笼，文献名邦匾额和贯通城门面向石板广场。",
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
  "description": "三重灰瓦飞檐逐层收进，彩绘斗拱、回廊与石栏勾勒楼阁层次，下方拱门连通古城街道。",
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
  "description": "青瓦白墙围成院落，蓝白边饰的福字照壁、雕饰门楼、木窗回廊与后方小洋楼共同呈现喜洲宅院。",
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
  "description": "红木戏台朝向石板广场，后方魁星阁抬高屋檐，两侧白族房屋围出表演空间。此处位于大理州剑川县。",
  "source": "https://touch.go.qunar.com/poi/5942814",
  "grounded": true,
  "hemisphere": -1
 }
];
const builders={south,wuhua,yan,shaxi,pagodas,putuo,xingsheng,cangshan};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Dali landmark: ${id}`);return builders[id](k);}
