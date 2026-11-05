import {boc,ifc,icc,hsbc} from './hongkong-towers.js';
import {cec,clock,mplus} from './hongkong-waterfront.js';
import {peak,buddha,chilin} from './hongkong-hills.js';
export const LANDMARKS=[
 {
  "id": "boc",
  "name": "中银大厦",
  "area": "中环 · 三角折面与双天线",
  "x": 0.37111,
  "z": 1.45337,
  "hemisphere": 1,
  "height": 1.53,
  "distance": 3.2,
  "view": [
   0.65,
   0.5,
   1.9
  ],
  "description": "四组逐级上升的三角形塔身，以浅色交叉钢架、斜向顶部与双天线构成轮廓。蓝灰玻璃在夜间保留本色，窗灯缓慢变化。",
  "source": "https://www.pcf-p.com/projects/bank-of-china-tower/",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "ifc",
  "name": "国际金融中心二期",
  "area": "中环 · 收分塔身与冠部",
  "x": 1.49691,
  "z": 0.09617,
  "hemisphere": 1,
  "height": 1.43,
  "distance": 3.2,
  "view": [
   0.65,
   0.55,
   1.9
  ],
  "description": "银灰色塔身向顶部收分，横向设备层、细密竖梃与八片冠部围住内凹屋顶。",
  "source": "https://www.adamson-associates.com/project/international-finance-center/",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "hsbc",
  "name": "汇丰总行大厦",
  "area": "中环 · 悬吊结构与开放底层",
  "x": 0.55404,
  "z": -1.39393,
  "hemisphere": 1,
  "height": 1.15,
  "distance": 3.2,
  "view": [
   0.5,
   0.6,
   1.9
  ],
  "description": "高低三组玻璃体量由外露钢柱、大跨度悬吊桁架和侧面设备舱组织。圆弧顶冠、检修吊臂、双扶梯与门前铜狮补充建筑层次；夜间红色桁架与冷白窗灯缓慢变化，底层保持通透。",
  "source": "https://www.discoverhongkong.com/eng/place-to-go/travel.guide-hsbc-main-building.html",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "cec",
  "name": "香港会议展览中心",
  "area": "湾仔 · 飞鸟屋顶与滨水台阶",
  "x": -1.1545,
  "z": -0.95767,
  "hemisphere": 1,
  "height": 0.53,
  "distance": 3.2,
  "view": [
   0.75,
   1.05,
   1.9
  ],
  "description": "前后错落的浅银飞鸟屋顶覆盖蓝绿玻璃，内收檐口、退进幕墙与层叠露台构成轮廓。入口台阶接入滨水前场，夜间玻璃与檐边柔和透光。",
  "source": "https://dragageshk.com/project/hkcec-extension/",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "peak",
  "name": "凌霄阁",
  "area": "太平山顶 · 弧形观景台",
  "x": -1.26756,
  "z": 0.80206,
  "hemisphere": 1,
  "height": 1.0,
  "distance": 3.2,
  "view": [
   0.65,
   0.65,
   1.9
  ],
  "description": "弧形悬挑体量架在双柱和玻璃基座上，顶部围栏、内部层线与山坡台阶形成山顶观景建筑。",
  "source": "https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=The+Peak+and+Peak+Tram",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "icc",
  "name": "环球贸易广场",
  "area": "西九龙 · 内收转角与玻璃塔冠",
  "x": 0.37111,
  "z": 1.45337,
  "hemisphere": -1,
  "height": 1.61,
  "distance": 3.2,
  "view": [
   0.75,
   0.55,
   1.9
  ],
  "description": "高耸的蓝灰色玻璃塔楼保留内收转角、横向设备层和微微外展的低层裙部，夜晚由窗格与冠部灯光勾勒体量。",
  "source": "https://www.kpf.com/project/international-commerce-centre",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "clock",
  "name": "尖沙咀钟楼",
  "area": "红砖钟楼 · 四面时钟",
  "x": 1.49691,
  "z": 0.09617,
  "hemisphere": -1,
  "height": 1.37,
  "distance": 3.2,
  "view": [
   0.58,
   0.7,
   1.9
  ],
  "description": "红砖与浅色花岗岩构成方形塔身。四面罗马数字钟盘、内凹山花窗、两层八角阁楼和浅色混凝土圆顶形成轮廓，拱门前有连续台阶与水池。",
  "source": "https://www.hkculturalcentre.gov.hk/sc/hkcc/TSTClockTower/ThePresent.html",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "mplus",
  "name": "M+",
  "area": "西九文化区 · 横向展厅与媒体立面",
  "x": 0.55404,
  "z": -1.39393,
  "hemisphere": -1,
  "height": 0.71,
  "distance": 3.2,
  "view": [
   0.8,
   0.85,
   1.9
  ],
  "description": "横向展厅悬挑于开放门厅上方，与薄片式高层形成倒 T 形。深绿陶瓷格栅、屋顶花园、侧面混凝土体量和入口台阶构成细节；夜间嵌入灯带播放原创缓慢光纹。",
  "source": "https://www.mplus.org.hk/en/the-building/design/",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "chilin",
  "name": "志莲净苑",
  "area": "钻石山 · 唐式木构与四方莲池",
  "x": -1.1545,
  "z": -0.95767,
  "hemisphere": -1,
  "height": 0.4,
  "distance": 3.2,
  "view": [
   0.32,
   1.3,
   1.9
  ],
  "description": "灰瓦木构殿堂围合庭院，主殿、山门、两侧廊殿与四方莲池共同呈现净苑的层次，庭边保留盆景。",
  "source": "https://www.gohk.gov.hk/chs/spots/spot_detail.php?spot=Chi+Lin+Nunnery+%26+Nan+Lian+Garden",
  "grounded": true,
  "facesHarbour": true
 },
 {
  "id": "buddha",
  "name": "天坛大佛",
  "area": "昂坪 · 青铜坐像与山间长阶",
  "x": -1.26756,
  "z": 0.80206,
  "hemisphere": -1,
  "height": 1.0,
  "distance": 3.2,
  "view": [
   0.3,
   0.65,
   1.9
  ],
  "description": "青铜坐像以举起的右手、盘坐双腿、衣褶和莲座区分轮廓，三层石台与山间长阶连接林坡。",
  "source": "https://www.islands.gov.hk/en/explores-tai-o-tian-tan-buddha-statue.php",
  "grounded": true,
  "facesHarbour": true
 }
];
const builders={boc,ifc,icc,hsbc,cec,clock,mplus,peak,buddha,chilin};
export function createLandmark(k,id){if(!builders[id])throw new Error("Unknown Hong Kong landmark: "+id);return builders[id](k);}
