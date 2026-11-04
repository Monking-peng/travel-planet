import {church,station,huashi} from './qingdao-heritage.js';
import {zhanqiao,wind,marina} from './qingdao-coast.js';
import {signal,taiqing} from './qingdao-hills.js';
export const LANDMARKS=[
 {
  "id": "zhanqiao",
  "name": "栈桥·回澜阁",
  "area": "海上栈桥 · 双层八角阁",
  "x": -1.08,
  "z": 0.94,
  "height": 0.7,
  "distance": 3.15,
  "view": [
   0.4,
   0.85,
   1.9
  ],
  "description": "黄色琉璃瓦、红柱与蓝绿梁枋构成双层八角阁。亭阁落在海上半圆平台，窄长石堤与蓝色栏杆连接岸边。",
  "source": "https://qd.ifeng.com/c/8K6MrGMvQE8",
  "grounded": true
 },
 {
  "id": "wind",
  "name": "五四广场·五月的风",
  "area": "红色螺旋 · 滨海广场",
  "x": 1.08,
  "z": 0.94,
  "height": 0.7,
  "distance": 2.85,
  "view": [
   0.24,
   0.65,
   1.8
  ],
  "description": "红色钢构以有空隙的宽带向上旋转，体量在上部展开。圆形绿地、石基和环形步道围绕雕塑展开。",
  "source": "https://m.jiemian.com/article/14133576.html",
  "grounded": true
 },
 {
  "id": "church",
  "name": "圣弥厄尔大教堂",
  "area": "双塔红顶 · 花岗岩立面",
  "x": -1.08,
  "z": -0.94,
  "height": 1.02,
  "distance": 3.1,
  "view": [
   0.32,
   0.65,
   1.8
  ],
  "description": "红顶双塔以红褐百叶、石砌转角和金属十字架分层；正门补入雕饰、凹入的玫瑰窗与拱廊。侧翼、两侧低廊和半圆后殿组成完整轮廓，夜间柔光保留浅黄色墙面与红瓦。",
  "source": "https://beyondvision.cn/show/956.html",
  "grounded": true
 },
 {
  "id": "marina",
  "name": "奥帆中心",
  "area": "帆影港湾 · 火炬与灯塔",
  "x": 1.08,
  "z": -0.94,
  "height": 0.64,
  "distance": 3.25,
  "view": [
   0.35,
   1.1,
   1.8
  ],
  "description": "白帆与桅杆立在港池中，情人坝白灯塔和火炬码头分居两侧，沿石砌堤岸展开滨海视野。",
  "source": "https://www.qosmcareas.com/scenic.html",
  "grounded": true
 },
 {
  "id": "huashi",
  "name": "八大关·花石楼",
  "area": "花岗岩城堡 · 圆塔柱廊",
  "x": -1.08,
  "z": 0.94,
  "height": 0.68,
  "distance": 2.8,
  "view": [
   0.42,
   0.75,
   1.8
  ],
  "description": "粗颗粒石墙、圆形塔楼、白框拱窗与入口柱廊，屋顶保留城垛和露台。庭院树木只在建筑后方形成围合。",
  "source": "https://dp.pconline.com.cn/photo/list_2302125.html",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "station",
  "name": "青岛站·东立面",
  "area": "红瓦钟楼 · 百年车站",
  "x": 1.08,
  "z": 0.94,
  "height": 1.0,
  "distance": 3.15,
  "view": [
   0.4,
   0.68,
   1.8
  ],
  "description": "钟楼位于主入口一侧，红瓦尖顶、阶梯山花、圆盘时钟与两翼连续拱窗，构成老站房的鲜明轮廓。",
  "source": "https://www.dailyqd.com/arc/2016-09/22/content_352743.htm",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "signal",
  "name": "信号山观景楼",
  "area": "三座红球 · 山顶眺望",
  "x": -1.08,
  "z": -0.94,
  "height": 0.76,
  "distance": 3.0,
  "view": [
   0.35,
   0.9,
   1.8
  ],
  "description": "三座高低不同的红色球形观景楼，以石砌楼身、整圈玻璃窗带和白色支撑相连。背后的林冠保留山顶公园气质。",
  "source": "https://www.qingdaonese.com/signal-hill-%E4%BF%A1%E5%8F%B7%E5%B1%B1-qingdao/",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "taiqing",
  "name": "崂山·太清宫",
  "area": "蓝瓦山门 · 山海道观",
  "x": 1.08,
  "z": -0.94,
  "height": 0.59,
  "distance": 3.05,
  "view": [
   0.3,
   0.95,
   1.8
  ],
  "description": "蓝绿琉璃山门与灰瓦三清殿前后相映，红墙之间是古树院落，后方由起伏的花岗岩峰围合。",
  "source": "https://www.trip.com/travel-guide/attraction/qingdao/laoshan-taiqing-palace-76762/",
  "grounded": true,
  "hemisphere": -1
 }
];
const builders={church,station,huashi,zhanqiao,wind,marina,signal,taiqing};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Qingdao landmark: ${id}`);return builders[id](k);}
