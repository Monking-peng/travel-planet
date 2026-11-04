import {eye,jiefang,tianta} from './tianjin-river.js';
import {xikai,porcelain,dule} from './tianjin-heritage.js';
import {minyuan,maritime} from './tianjin-civic.js';
export const LANDMARKS=[
 {
  "id": "eye",
  "name": "天津之眼·永乐桥",
  "area": "海河之眼 · 桥上摩天轮",
  "x": -1.08,
  "z": 0.94,
  "height": 1.22,
  "distance": 3.5,
  "view": [
   -0.65,
   0.65,
   2.0
  ],
  "description": "白色分叉支架从永乐桥升起，细辐条连起环形轮缘，独立轿厢围绕海河上空。入夜后轮缘以粉紫、青蓝与暖金缓慢变化。",
  "source": "https://www.visitourchina.com/tianjin/attraction/the-tientsin-eye.html",
  "grounded": true
 },
 {
  "id": "porcelain",
  "name": "瓷房子",
  "area": "瓷片镶嵌 · 曲线围墙",
  "x": 1.08,
  "z": 0.94,
  "height": 0.83,
  "distance": 3.0,
  "view": [
   0.3,
   0.65,
   1.85
  ],
  "description": "砖红洋楼以凸弧窗面、左侧通透阳台和收坡阁楼错落组合；青花与红彩瓷瓶沿围墙起伏，细碎瓷片覆盖柱头、檐口与屋顶。瓷龙、雕像和 China 字样保留轮廓，夜间柔光显示瓷饰层次。",
  "source": "https://www.chinaservicesinfo.com/s/202505/27/WS6835552b498eec7e1f737ccc/crowds-flock-to-tianjins-porcelain-house.html",
  "grounded": true
 },
 {
  "id": "xikai",
  "name": "西开教堂",
  "area": "红黄砖墙 · 三座绿穹顶",
  "x": -1.08,
  "z": -0.94,
  "height": 0.87,
  "distance": 3.0,
  "view": [
   0.32,
   0.7,
   1.8
  ],
  "description": "红黄相间的墙面、三座绿穹顶、圆拱入口和高窄窗，呈现西开教堂的层次。暖光沿入口与窗带展开。",
  "source": "https://gs.ctrip.com/html5/you/sight/tianjin154/10630.html",
  "grounded": true
 },
 {
  "id": "minyuan",
  "name": "五大道·民园广场",
  "area": "环形拱廊 · 中央草坪",
  "x": 1.08,
  "z": -0.94,
  "height": 0.37,
  "distance": 3.25,
  "view": [
   0.35,
   1.25,
   1.8
  ],
  "description": "两层连续拱廊环绕中央草坪，红瓦屋顶、正面大拱门与内侧步道形成完整的椭圆广场。夜间拱廊透出暖光。",
  "source": "https://m.thepaper.cn/wifiKey_detail.jsp?contid=7842004&from=wifiKey",
  "grounded": true
 },
 {
  "id": "jiefang",
  "name": "海河·解放桥",
  "area": "铆接钢桁架 · 河上通廊",
  "x": -1.08,
  "z": 0.94,
  "height": 0.51,
  "distance": 3.15,
  "view": [
   0.45,
   0.85,
   1.8
  ],
  "description": "灰色钢桁架、门式横梁、交叉撑杆和贯通桥面跨过水面。暖金灯光勾勒结构，桥头石碑标记这座海河老桥。",
  "source": "https://you.ctrip.com/sight/tianjin154/1556051.html",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "tianta",
  "name": "天塔·天塔湖",
  "area": "水上高塔 · 环形观景层",
  "x": 1.08,
  "z": 0.94,
  "height": 1.68,
  "distance": 3.6,
  "view": [
   0.35,
   0.65,
   1.8
  ],
  "description": "细长混凝土塔身从湖中升起，顶部层层展开的观景舱与细长天线形成鲜明轮廓，石堤连接湖岸。",
  "source": "https://www.tripadvisor.com.au/Attraction_Review-g311293-d1814662-Reviews-Tianta_Lake_Scenic_Resort-Tianjin.html",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "maritime",
  "name": "国家海洋博物馆",
  "area": "分叉展厅 · 临海悬挑",
  "x": -1.08,
  "z": -0.94,
  "height": 0.46,
  "distance": 3.35,
  "view": [
   0.9,
   1.1,
   1.65
  ],
  "description": "五组银白展厅伸向海湾，展厅之间以连桥联系，玻璃端面藏在曲折金属外壳下。前方入口平台接向海洋广场。",
  "source": "https://www.coxarchitecture.com.au/project/national-maritime-museum-of-china/",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "dule",
  "name": "蓟州·独乐寺观音阁",
  "area": "辽代木构 · 深檐斗拱",
  "x": 1.08,
  "z": -0.94,
  "height": 0.75,
  "distance": 3.05,
  "view": [
   0.28,
   0.8,
   1.8
  ],
  "description": "灰瓦重檐、暗红木柱、厚重斗拱与上层回廊构成观音阁，前方石台与香炉保留古寺院落的安静尺度。",
  "source": "https://www.tj.gov.cn/sq/yztj/jgtp/202005/t20200520_2468035.html",
  "grounded": true,
  "hemisphere": -1
 }
];
const builders={eye,jiefang,tianta,xikai,porcelain,dule,minyuan,maritime};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Tianjin landmark: ${id}`);return builders[id](k);}
