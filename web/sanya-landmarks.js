import {nanshan,tianya,luhuitou} from './sanya-culture.js';
import {phoenix,atlantis,dutyfree} from './sanya-resorts.js';
import {lovers,dragon} from './sanya-coast.js';
export const LANDMARKS=[
 {
  "id": "nanshan",
  "name": "南山·海上观音",
  "area": "三面观音 · 莲台与普济桥",
  "x": -1.08,
  "z": 0.94,
  "height": 1.07,
  "distance": 3.1,
  "view": [
   -0.65,
   0.65,
   1.9
  ],
  "description": "白色三面观音立于金色莲座和八角基座之上，石栏、浮雕分格和凹入门厅环绕平台；普济桥经连续石阶连接海岸。",
  "source": "https://www.visitsanya.com/zh/destination/南山文化旅游区",
  "grounded": true
 },
 {
  "id": "phoenix",
  "name": "凤凰岛",
  "area": "五座弧塔 · 海岸灯影",
  "x": 1.08,
  "z": 0.94,
  "height": 0.79,
  "distance": 3.25,
  "view": [
   0.2,
   0.65,
   1.9
  ],
  "description": "五座扁宽弧塔以不同朝向沿海岸排列，白色侧肋、横向阳台与顶部退台勾出贝壳轮廓。低矮门厅连接海岛步道，夜间冷白与浅金色灯带沿立面缓慢流动。",
  "source": "https://www.visitsanya.com/destination/fenghuang-island",
  "grounded": true
 },
 {
  "id": "atlantis",
  "name": "三亚亚特兰蒂斯",
  "area": "双鳍高楼 · 流线阳台",
  "x": -1.08,
  "z": -0.94,
  "height": 1.44,
  "distance": 3.2,
  "view": [
   0.5,
   0.6,
   1.9
  ],
  "description": "高低双鳍与金色楼冠连成弧形塔身，连续阳台包围蓝绿玻璃；低矮旋涡屋盖、玻璃门厅与水庭相接，夜间客房暖光和细密楼冠保持层次。",
  "source": "https://www.hok.com/projects/view/atlantis-sanya-resort/",
  "grounded": true
 },
 {
  "id": "dutyfree",
  "name": "三亚国际免税城·一期",
  "area": "海棠湾 · 曲面双馆",
  "x": 1.08,
  "z": -0.94,
  "height": 0.29,
  "distance": 3.0,
  "view": [
   0.35,
   1.4,
   1.8
  ],
  "description": "一期双叶形馆体由前后拱形屋盖连成一体，四座玻璃采光顶围绕露天中庭；细密幕墙、暖色室内光与浅蓝檐口点光形成日夜层次。",
  "source": "https://www.cdfg.com.cn/5257/5257.html",
  "grounded": true
 },
 {
  "id": "tianya",
  "name": "天涯海角",
  "area": "刻字巨石 · 沙滩椰影",
  "x": -1.08,
  "z": 0.94,
  "height": 0.66,
  "distance": 3.05,
  "view": [
   0.2,
   0.62,
   1.9
  ],
  "description": "宽厚的天涯石与不规则海角石立在沙岸，横排红色刻字贴合裂隙石面，深色风化纹与浅色石脚形成层次；潮湿沙带和椰影围绕岸边。",
  "source": "https://dp.pconline.com.cn/photo/2493209.html",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "luhuitou",
  "name": "鹿回头",
  "area": "山顶石雕 · 回望三亚",
  "x": 1.08,
  "z": 0.94,
  "height": 0.89,
  "distance": 3.05,
  "view": [
   0.34,
   0.7,
   1.9
  ],
  "description": "山顶台阶通往浅色石雕，回首的鹿、人物与岩体连成一体，雕像周围保留低矮观景平台和山林。",
  "source": "https://www.visitsanya.com/zh/destination/鹿回头风景区",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "lovers",
  "name": "蜈支洲岛·情人桥",
  "area": "红木栈桥 · 临海双檐亭",
  "x": -1.08,
  "z": -0.94,
  "height": 0.47,
  "distance": 3.0,
  "view": [
   0.65,
   0.95,
   1.9
  ],
  "description": "红木栈桥经台阶从沙滩伸向海上岩礁，双心栏板、石砌桥墩和双檐亭相连；细密瓦肋与温暖栏边光勾勒海岸轮廓。",
  "source": "https://www.wuzhizhou.com/islandStyle/detail_9959.html",
  "grounded": true,
  "hemisphere": -1
 },
 {
  "id": "dragon",
  "name": "亚龙湾·过江龙索桥",
  "area": "雨林山谷 · 悬索步桥",
  "x": 1.08,
  "z": -0.94,
  "height": 0.74,
  "distance": 3.0,
  "view": [
   0.15,
   0.95,
   1.9
  ],
  "description": "细长木桥悬跨真实山谷，桥面与细网随跨度下垂；两端短平台接入山坡，疏密有致的雨林树冠围绕桥身，保留开阔的步行净空。",
  "source": "https://www.ylwpark.com/news/detail/id/195.html",
  "grounded": true,
  "hemisphere": -1
 }
];
const builders={nanshan,tianya,luhuitou,phoenix,atlantis,dutyfree,lovers,dragon};
export function createLandmark(k,id){if(!builders[id])throw new Error('Unknown Sanya landmark: '+id);return builders[id](k);}
