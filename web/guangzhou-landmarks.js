import {museum} from './guangzhou-museum.js';
import {shamian} from './guangzhou-shamian.js';
import {opera} from './guangzhou-opera.js';
import {canton,twins} from './guangzhou-modern.js';
import {memorial,chen,rams} from './guangzhou-heritage.js';
import {cathedral} from './guangzhou-cathedral.js';
import {haixin,huacheng} from './guangzhou-riverfront.js';

export const LANDMARKS=[
  {id:'canton',name:'广州塔',area:'海珠 · 珠江地标',x:-.95,z:.30,height:1.87,distance:3.5,view:[.6,.55,1.8],description:'银白色扭转网架形成收腰，内部核心筒、观光平台、顶部摩天轮轿厢与天线分层呈现。夜间彩色灯光沿网架缓慢变化，保留通透的钢结构。',source:'https://www.eguangzhou.gov.cn/globalgzpastandpresence/content/post_31123.html'},
  {id:'twins',name:'珠江新城东西塔',area:'天河 · 城市天际线',x:1.76,z:.02,rotation:Math.PI/2,height:1.67,distance:3.65,view:[.5,.7,1.8],description:'西塔以弧面三角轮廓和菱形网格表现，东塔以浅色竖向构件与四段退台表现。两塔保持不同的塔冠、比例与夜间照明。',source:'https://www.kpf.com/project/ctf-finance-centre'},
  {id:'opera',name:'广州大剧院',area:'天河 · 双砾石',x:1.05,z:-1.35,height:.45,distance:2.8,view:[.5,.75,1.5],description:'深灰大剧场与浅色小剧场形成双砾石轮廓，圆润石壳包住倾斜三角玻璃。水池旁的连续步道连接两座入口；冷白幕墙与暖色低位照明分开表达。',source:'https://www.zha.com/projects/architecture/guangzhou-opera-house?disclaimer=true'},
  {id:'museum',name:'广东省博物馆',area:'天河 · 珍宝容器',x:1.04,z:1.32,height:.58,distance:2.6,view:[.6,.65,1.5],description:'方正悬挑的灰色宝盒嵌入深红凹槽，玻璃展廊向外突出，屋顶中庭内退。细石板缝、缓坡与中央台阶组织入口；夜间以深红内壁和柔和窗光表现进深。',source:'https://www.gooood.cn/guangdong-museum-by-rocco-design-architects-ltd.htm'},
  {id:'memorial',name:'中山纪念堂',area:'越秀 · 蓝瓦八角大堂',x:-1.02,z:.79,hemisphere:-1,height:.70,distance:2.8,view:[.40,.67,1.6],description:'八角大厅与层层蓝色琉璃瓦顶、红柱门廊和天下为公匾额。保留宽阔的前庭石阶，夜间以暖色檐下照明衬托蓝瓦。',source:'https://dp.pconline.com.cn/photo/list_3205165.html'},
  {id:'chen',name:'陈家祠',area:'荔湾 · 岭南建筑与陶塑',x:1.05,z:.80,hemisphere:-1,height:.38,distance:2.9,view:[.45,1.25,1.3],description:'三进三路的厅堂与开放庭院，青灰砖墙、硬山瓦顶、连廊和陶塑屋脊。陶塑用小型人物与亭阁轮廓简化表达，不以随机民居替代祠堂。',source:'https://wglj.gz.gov.cn/ztmb/gzhyn/ajjq/4a/content/post_9773088.html'},
  {id:'cathedral',name:'石室圣心大教堂',area:'越秀 · 石构双塔',x:-1.06,z:-1.04,hemisphere:-1,height:1.20,distance:3.1,view:[1.2,.60,1.8],description:'花岗岩双尖塔、层层退入的尖拱门、玫瑰花窗与长向中殿。较低侧廊、上部高窗和开放飞扶壁沿两侧展开；夜间暖光照亮石柱与深色花窗，保留石材层次。',source:'https://www.yuexiu.gov.cn/zjyx/yxjd/zjwh/content/post_8665100.html'},
  {id:'rams',name:'五羊石像',area:'越秀山 · 羊城象征',x:1.03,z:-1.05,hemisphere:-1,height:.85,distance:2.6,view:[.45,.60,1.6],description:'五只姿态不同的石羊围绕山石，主羊高立、其余四羊环绕；雕塑以浅色石材、花坛和林荫组织成完整景点。',source:'https://www.gzass.gd.cn/whzc/wenhuaziyuan/wenhuajingguan/129.html'},
  {id:'haixin',name:'海心桥',area:'珠江 · 步行桥',x:0,z:-.61,height:.44,distance:2.5,view:[.30,1.1,1.6],description:'单道白色斜拱与弯曲步道跨过珠江，细钢索连接桥面，两端分叉坡道接入江岸。暖色栏杆和白色拱灯形成清晰的夜间轮廓。',source:'https://www.haizhu.gov.cn/hzdt/ztlm/tzhz/rjhj/lyjd/csmp/content/post_9195706.html'},
  {id:'huacheng',name:'花城广场',area:'珠江新城 · 城市绿轴',x:.78,z:.10,height:.16,distance:2.25,view:[.35,1.4,1.2],description:'林荫步行轴串起花坛、喷泉和浮岛水景，连接东西塔与江岸。用暖色树下照明、低位地灯和水面倒影表现夜间层次，不复刻临时活动灯光。',source:'https://www.gdfao.gov.cn/zwgk/zdly/gzscfd/content/post_1333472.html'},
  {id:'shamian',name:'沙面历史街区',area:'荔湾 · 露德堂与海关红楼',x:-1.1,z:1.60,height:.86,distance:3.1,view:[.48,.72,1.8],description:'浅米黄的露德圣母堂与红砖海关红楼相对展开，尖拱、圆窗、外廊和铁栏保留各自形制。林荫步道串起两座建筑，夜间以暖色低位灯和窗光呈现。两处代表建筑组合为缩微场景，不是沙面街区完整平面。',source:'https://www.gz.gov.cn/zlgz/gzly/wzgz/zjcs/tzj/content/post_7760626.html'},
].map(item=>({...item,grounded:true}));
const builders={shamian,canton,twins,opera,museum,memorial,chen,cathedral,rams,haixin,huacheng};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Guangzhou landmark: ${id}`);return builders[id](k);}
