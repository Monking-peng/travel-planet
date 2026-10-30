import {canton,twins,opera,museum} from './guangzhou-modern.js';
import {memorial,chen,cathedral,rams} from './guangzhou-heritage.js';

export const LANDMARKS=[
  {id:'canton',name:'广州塔',area:'海珠 · 珠江地标',x:-.88,z:.70,height:1.87,distance:3.5,view:[.6,.55,1.8],description:'银白色扭转网架形成收腰，内部核心筒、观光平台、顶部摩天轮轿厢与天线分层呈现。夜间彩色灯光沿网架缓慢变化，保留通透的钢结构。',source:'https://www.eguangzhou.gov.cn/globalgzpastandpresence/content/post_31123.html'},
  {id:'twins',name:'珠江新城东西塔',area:'天河 · 城市天际线',x:.97,z:.70,height:1.67,distance:3.65,view:[.5,.7,1.8],description:'西塔以弧面三角轮廓和菱形网格表现，东塔以浅色竖向构件与四段退台表现。两塔保持不同的塔冠、比例与夜间照明。',source:'https://www.kpf.com/project/ctf-finance-centre'},
  {id:'opera',name:'广州大剧院',area:'天河 · 双砾石',x:-1.04,z:-1.02,height:.45,distance:2.8,view:[.5,.75,1.5],description:'两块大小不同的折面建筑围绕水池展开；灰色石材面、三角玻璃幕墙和内部暖光保留双砾石建筑的主要特征。',source:'https://www.gzass.gd.cn/whzc/wenhuasheshi/yingjuyuan/120.html'},
  {id:'museum',name:'广东省博物馆',area:'天河 · 珍宝容器',x:1.08,z:-1.02,height:.58,distance:2.6,view:[.6,.65,1.5],description:'悬挑的灰色盒体上嵌入深红凹槽，底部收进形成入口与阴影。石材板缝、台阶和红色内壁共同表达立面层次。',source:'https://www.archdaily.com/127122/guangdong-museum-rocco-design-architects'},
  {id:'memorial',name:'中山纪念堂',area:'越秀 · 蓝瓦八角大堂',x:-1.02,z:.79,hemisphere:-1,height:.70,distance:2.8,view:[.40,.67,1.6],description:'八角大厅与层层蓝色琉璃瓦顶、红柱门廊和天下为公匾额。保留宽阔的前庭石阶，夜间以暖色檐下照明衬托蓝瓦。',source:'https://dp.pconline.com.cn/photo/list_3205165.html'},
  {id:'chen',name:'陈家祠',area:'荔湾 · 岭南建筑与陶塑',x:1.05,z:.80,hemisphere:-1,height:.38,distance:2.9,view:[.45,1.25,1.3],description:'三进三路的厅堂与开放庭院，青灰砖墙、硬山瓦顶、连廊和陶塑屋脊。陶塑用小型人物与亭阁轮廓简化表达，不以随机民居替代祠堂。',source:'https://wglj.gz.gov.cn/ztmb/gzhyn/ajjq/4a/content/post_9773088.html'},
  {id:'cathedral',name:'石室圣心大教堂',area:'越秀 · 石构双塔',x:-1.06,z:-1.04,hemisphere:-1,height:1.20,distance:3.1,view:[.35,.55,1.8],description:'浅色花岗岩双尖塔、玫瑰花窗、尖拱门与长向中殿。以深浅石构和细小灯光表达层次，夜景为艺术化呈现。',source:'https://www.yuexiu.gov.cn/zjyx/yxjd/zjwh/content/post_8665100.html'},
  {id:'rams',name:'五羊石像',area:'越秀山 · 羊城象征',x:1.03,z:-1.05,hemisphere:-1,height:.85,distance:2.6,view:[.45,.60,1.6],description:'五只姿态不同的石羊围绕山石，主羊高立、其余四羊环绕；雕塑以浅色石材、花坛和林荫组织成完整景点。',source:'https://www.gzass.gd.cn/whzc/wenhuaziyuan/wenhuajingguan/129.html'},
].map(item=>({...item,grounded:true}));
const builders={canton,twins,opera,museum,memorial,chen,cathedral,rams};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Guangzhou landmark: ${id}`);return builders[id](k);}
