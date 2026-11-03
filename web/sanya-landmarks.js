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
  "description": "白色三面观音立于金色莲台，层层基座、海上平台与普济桥连接岸边。白色衣褶、持物与冠饰分别表现。",
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
  "description": "五座贝壳状曲面楼沿岛岸排列，横向楼层与竖向弧线分出轮廓。夜晚冷白与浅彩灯带缓慢变化。",
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
  "description": "相连的双鳍塔身向上收拢，连续浅色阳台环绕蓝绿玻璃，顶部暖金灯光与低矮旋涡式门厅相接。",
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
  "description": "一期双馆以连续白色曲面屋顶和四处采光穹顶围合中庭，玻璃立面与跨院连桥相连，夜景以冷蓝檐边和暖金室内分层。",
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
  "description": "两块刻字花岗岩在沙滩上形成不同轮廓，石面保留风化色差，海浪与椰树围绕海岸展开。",
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
  "description": "红色木栈桥从沙滩伸向海上岩礁，心形栏板、露出水面的桥墩和双檐亭形成完整海岸景观。",
  "source": "https://www.haihua365.com/diyu/5542",
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
  "description": "细窄木桥跨越两座林坡，桥面与侧索随跨度下垂，网状护栏、端部锚座和谷地高差共同呈现雨林步桥。",
  "source": "https://www.ylwpark.com/news/detail/id/195.html",
  "grounded": true,
  "hemisphere": -1
 }
];
const builders={nanshan,tianya,luhuitou,phoenix,atlantis,dutyfree,lovers,dragon};
export function createLandmark(k,id){if(!builders[id])throw new Error('Unknown Sanya landmark: '+id);return builders[id](k);}
